import { Migration } from "@mikro-orm/migrations";

export class Migration20231027200351_add_pdf_document_type extends Migration {
  async up(): Promise<void> {
    this.addSql('alter table "document" drop constraint if exists "document_type_check";');

    this.addSql('alter table "document" alter column "type" type text using ("type"::text);');
    this.addSql('alter table "document" add constraint "document_type_check" check ("type" in (\'ebook\', \'pdf\'));');
  }

  async down(): Promise<void> {
    this.addSql('alter table "document" drop constraint if exists "document_type_check";');

    this.addSql('alter table "document" alter column "type" type text using ("type"::text);');
    this.addSql('alter table "document" add constraint "document_type_check" check ("type" in (\'ebook\'));');
  }
}
