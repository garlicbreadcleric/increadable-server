export enum MimeType {
  EPUB = "application/epub+zip",
  FB2 = "text/fb2+xml",
  MARKDOWN = "text/markdown",
  PDF = "application/pdf",
  HTML = "text/html",
}

export type BookMimeType = MimeType.EPUB | MimeType.FB2 | MimeType.MARKDOWN;
