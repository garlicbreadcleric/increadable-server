import { Entity, Enum, PrimaryKey, Property } from "@mikro-orm/core";

import { DocumentType } from "./document-type.enum";
import { DocumentFile } from "./document-file.type";
import { DocumentMetadata } from "./document-metadata.type";
import { MimeType } from "./mime-type.enum";

@Entity({ tableName: "document" })
export class DocumentEntity {
  @PrimaryKey()
  id: string;

  @Enum({ items: () => DocumentType })
  type: DocumentType;

  @Property({ type: "json" })
  metadata: DocumentMetadata;

  @Property({ type: "json" })
  files: DocumentFile[] = [];

  @Property()
  originalFileUrl: string;

  @Property({ persist: false })
  get previewFileUrl(): string | undefined {
    return this.files.find((f) => {
      switch (this.type) {
        case DocumentType.EBOOK:
          return f.mimeType === MimeType.HTML;
        case DocumentType.PDF:
          return f.mimeType === MimeType.PDF;
      }
    })?.url;
  }
}
