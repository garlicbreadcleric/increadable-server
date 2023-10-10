import { Migration } from "@mikro-orm/migrations";

export class Migration20230918010231_add_document_metadata extends Migration {
  async up(): Promise<void> {
    this.addSql('alter table "document" add column "metadata" jsonb not null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "document" drop column "metadata";');
  }
}
