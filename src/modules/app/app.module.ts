import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { FileModule } from "../document/document.module";
import { DbModule } from "../db/db.module";

@Module({
  imports: [ConfigModule.forRoot(), DbModule, FileModule],
})
export class AppModule {}
