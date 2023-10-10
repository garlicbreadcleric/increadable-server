import { Controller, Get, Param, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBody, ApiConsumes, ApiCreatedResponse, ApiOkResponse, ApiTags } from "@nestjs/swagger";

import { FileService } from "./document.service";
import { UploadFileDto } from "./dto/upload-file.dto";
import { DocumentDto } from "./dto/document.dto";
import { plainToInstance } from "class-transformer";
import { DocumentMetadata } from "./document-metadata.type";

@ApiTags("Document")
@Controller("v1/documents")
export class FileController {
  constructor(private fileService: FileService) {}

  @Get("/:documentId")
  @ApiOkResponse({ type: DocumentDto })
  async findById(@Param("documentId") documentId): Promise<DocumentDto> {
    const document = await this.fileService.findById(documentId);
    return plainToInstance(DocumentDto, document);
    // return {
    //   id: document.id,
    //   type: document.type,
    //   previewFileUrl: document.previewFileUrl!,
    //   metadata: plainToInstance(DocumentMetadata, document.metadata),
    // };
  }

  @Post()
  @ApiConsumes("multipart/form-data")
  @ApiBody({ type: UploadFileDto })
  @ApiCreatedResponse({ type: DocumentDto })
  @UseInterceptors(FileInterceptor("file"))
  async upload(@UploadedFile() file: Express.Multer.File): Promise<DocumentDto> {
    const document = await this.fileService.upload(file);
    return plainToInstance(DocumentDto, document);
    // return {
    //   id: document.id,
    //   type: document.type,
    //   previewFileUrl: document.previewFileUrl!,
    //   metadata: plainToInstance(DocumentMetadata, document.metadata),
    // };
  }
}
