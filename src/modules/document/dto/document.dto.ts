import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose, Type } from "class-transformer";
import { IsEnum, IsNotEmpty, IsString, IsUrl, ValidateNested } from "class-validator";

import { DocumentType } from "../document-type.enum";
import { DocumentMetadata } from "../document-metadata.type";

@Exclude()
export class DocumentDto {
  @Expose()
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;

  @Expose()
  @ApiProperty({ enum: DocumentType, enumName: "DocumentType" })
  @IsEnum(DocumentType)
  type: string;

  @Expose()
  @ApiProperty()
  @IsUrl()
  originalFileUrl: string;

  @Expose()
  @ApiProperty()
  @IsUrl()
  previewFileUrl: string;

  @Expose()
  @ApiProperty({ type: DocumentMetadata })
  @Type(() => DocumentMetadata)
  @ValidateNested()
  metadata: DocumentMetadata;
}
