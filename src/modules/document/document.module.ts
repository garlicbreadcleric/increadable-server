import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { FileController } from "./document.controller";
import { FileService } from "./document.service";

@Module({
  controllers: [FileController],
  providers: [FileService],
  imports: [ConfigModule],
})
export class FileModule {}
