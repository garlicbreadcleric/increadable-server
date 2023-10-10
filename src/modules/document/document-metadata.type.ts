import { ApiPropertyOptional } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";
import { IsOptional, IsString } from "class-validator";

@Exclude()
export class DocumentMetadata {
  @Expose()
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  title?: string;

  @Expose()
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  subtitle?: string;

  @Expose()
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  authors?: string[];

  @Expose()
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  date?: string;
}
