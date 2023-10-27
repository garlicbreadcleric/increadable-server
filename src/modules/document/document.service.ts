import * as path from "path";

import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityManager, EntityRepository } from "@mikro-orm/core";
import { PutObjectCommandOutput, S3 } from "@aws-sdk/client-s3";
import slugify from "slugify";
import { JSDOM } from "jsdom";

import { md5 } from "../../lib/helpers/md5.helper";
import { ServiceException, ServiceExceptionCode, assert } from "../../lib/errors/service.error";
import { PandocFrom, pandocConvert } from "../../lib/helpers/pandoc.helper";
import { DocumentType } from "./document-type.enum";
import { DocumentEntity } from "./document.entity";
import { DocumentFile } from "./document-file.type";
import { DocumentMetadata } from "./document-metadata.type";
import { BookMimeType, MimeType } from "./mime-type.enum";

@Injectable()
export class FileService {
  private s3: S3;
  private bucket: string;
  private region: string;

  constructor(
    private configService: ConfigService,
    private em: EntityManager,
    @InjectRepository(DocumentEntity) private documentRepository: EntityRepository<DocumentEntity>,
  ) {
    this.region = configService.getOrThrow("S3_REGION");
    this.s3 = new S3({
      region: this.region,
      credentials: {
        accessKeyId: configService.getOrThrow("S3_ACCESS_KEY"),
        secretAccessKey: configService.getOrThrow("S3_SECRET_KEY"),
      },
    });
    this.bucket = configService.getOrThrow("S3_BUCKET");
  }

  async findById(documentId: string): Promise<DocumentEntity> {
    const document = await this.documentRepository.findOne({ id: documentId });
    assert(document != null, ServiceExceptionCode.DOCUMENT_NOT_FOUND, { documentId });
    return document;
  }

  async upload(file: Express.Multer.File): Promise<DocumentEntity> {
    const checksum = md5(file.buffer);
    const documentId = `${this.sanitizeName(file.originalname)}-${checksum}`;

    const existingDocument = await this.documentRepository.findOne({ id: documentId });
    if (existingDocument != null) {
      const previewMimeType = this.previewMimeType(existingDocument.type);
      const previewFile = existingDocument.files.find((file) => file.mimeType === previewMimeType);
      assert(previewFile != null, ServiceExceptionCode.PREVIEW_NOT_FOUND, { documentId, mimeType: previewMimeType });
      return existingDocument;
    }

    let mimeType = file.mimetype;
    if (mimeType?.trim() ?? "" === "") {
      switch (path.extname(file.originalname)) {
        case ".md":
        case ".markdown":
          mimeType = MimeType.MARKDOWN;
          break;
        case ".epub":
          mimeType = MimeType.EPUB;
          break;
        case ".fb2":
          mimeType = MimeType.FB2;
          break;
        case ".pdf":
          mimeType = MimeType.PDF;
          break;
      }
    }

    switch (mimeType) {
      case MimeType.EPUB:
      case MimeType.MARKDOWN:
      case MimeType.FB2: {
        const ext = this.extensionFromMimeType(mimeType);

        const originalName = `${documentId}${ext}`;
        const previewName = `${documentId}.html`;

        const originalUrl = `https://${this.bucket}.s3.${this.region}.amazonaws.com/${originalName}`;
        const previewUrl = `https://${this.bucket}.s3.${this.region}.amazonaws.com/${previewName}`;

        const { buffer: previewBuffer, metadata } = await this.convertToHtml(file.buffer, mimeType);

        await this.putObject(originalName, file.buffer, file.mimetype);
        await this.putObject(previewName, previewBuffer, MimeType.HTML);

        const originalFile: DocumentFile = {
          mimeType,
          url: originalUrl,
        };
        const previewFile: DocumentFile = {
          mimeType: MimeType.HTML,
          url: previewUrl,
        };

        const document = this.documentRepository.assign(new DocumentEntity(), {
          id: documentId,
          type: DocumentType.EBOOK,
          metadata,
          originalFileUrl: originalUrl,
          files: [originalFile, previewFile],
        });

        await this.em.persistAndFlush([document]);

        return document;
      }
      case MimeType.PDF: {
        const fileName = `${documentId}.pdf`;
        const fileUrl = `https://${this.bucket}.s3.${this.region}.amazonaws.com/${fileName}`;

        await this.putObject(fileName, file.buffer, file.mimetype);

        const documentFile: DocumentFile = {
          mimeType,
          url: fileUrl,
        };

        const document = this.documentRepository.assign(new DocumentEntity(), {
          id: documentId,
          type: DocumentType.PDF,
          metadata: {},
          originalFileUrl: fileUrl,
          previewFileUrl: fileUrl,
          files: [documentFile],
        });

        await this.em.persistAndFlush([document]);

        return document;
      }
      default:
        throw new ServiceException(ServiceExceptionCode.MIMETYPE_NOT_SUPPORTED, { mimeType });
    }
  }

  private async putObject(key: string, buffer: Buffer, mimeType: string): Promise<PutObjectCommandOutput> {
    return await this.s3.putObject({
      Body: buffer,
      Bucket: this.bucket,
      ContentType: `${mimeType};charset=utf-8`,
      Key: key,
    });
  }

  private sanitizeName(fileName: string): string {
    const parsedName = path.parse(fileName);
    return slugify(parsedName.name, {
      locale: "en",
      lower: true,
      replacement: "-",
      strict: true,
      trim: true,
    });
  }

  private previewMimeType(documentType: DocumentType): MimeType {
    switch (documentType) {
      case DocumentType.EBOOK:
        return MimeType.HTML;
      case DocumentType.PDF:
        return MimeType.PDF;
    }
  }

  private async convertToHtml(
    buffer: Buffer,
    mimeType: BookMimeType,
  ): Promise<{ buffer: Buffer; metadata: DocumentMetadata }> {
    const convertedBuffer = await pandocConvert({
      buffer,
      ...this.pandocOptionsFromMimeType(mimeType),
      to: "html",
      templatePath: this.configService.getOrThrow("PANDOC_TEMPLATE"),
    });
    const document = new JSDOM(convertedBuffer).window.document;
    const body = document.body.innerHTML;
    const outputBuffer = Buffer.from(body, "utf-8");
    const title = document.head.querySelector("meta[name=title]")?.getAttribute("content");
    const subtitle = document.head.querySelector("meta[name=subtitle]")?.getAttribute("content");
    const authors: string[] = Array.from(document.head.querySelectorAll("meta[name=author]")).map(
      (m) => m.getAttribute("content")!,
    );
    const date = document.head.querySelector("meta[name=date]")?.getAttribute("content");

    const metadata: DocumentMetadata = {};
    if (title != null) metadata.title = title;
    if (subtitle != null) metadata.subtitle = subtitle;
    metadata.authors = authors;
    if (date != null) metadata.date = date;

    return { buffer: outputBuffer, metadata };
  }

  private pandocOptionsFromMimeType(mimeType: BookMimeType): {
    from: PandocFrom;
    fromOptions?: string;
  } {
    switch (mimeType) {
      case MimeType.EPUB:
        return { from: "epub" };
      case MimeType.FB2:
        return { from: "fb2" };
      case MimeType.MARKDOWN:
        return { from: "markdown", fromOptions: "+autolink_bare_uris+mark" };
    }
  }

  private extensionFromMimeType(mimeType: MimeType): string {
    switch (mimeType) {
      case MimeType.EPUB:
        return ".epub";
      case MimeType.FB2:
        return ".fb2";
      case MimeType.MARKDOWN:
        return ".md";
      case MimeType.HTML:
        return ".html";
      case MimeType.PDF:
        return ".pdf";
    }
  }
}
