import { Migration } from "@mikro-orm/migrations";

export class Migration20230917004409_create_document_entity extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table "document" ("id" varchar(255) not null, "type" text check ("type" in (\'ebook\')) not null, "files" jsonb not null, "original_file_url" varchar(255) not null, constraint "document_pkey" primary key ("id"));',
    );
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "document" cascade;');
  }
}
