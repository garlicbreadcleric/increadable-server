import { Global, Module } from "@nestjs/common";
import { MikroOrmModule } from "@mikro-orm/nestjs";

import { DocumentEntity } from "../document/document.entity";

@Global()
@Module({
  imports: [MikroOrmModule.forRoot(), MikroOrmModule.forFeature([DocumentEntity])],
  exports: [MikroOrmModule],
})
export class DbModule {}
