import { HttpStatus } from "@nestjs/common";

export enum ServiceExceptionCode {
  DOCUMENT_NOT_FOUND = "document_not_found",
  PREVIEW_NOT_FOUND = "preview_not_found",
  MIMETYPE_NOT_SUPPORTED = "mimetype_not_supported",
}

export class ServiceException extends Error {
  public readonly status: HttpStatus;

  constructor(
    public readonly code: ServiceExceptionCode,
    public readonly options: any = {},
  ) {
    super(`ServiceError ${code}`);
    this.status = toHttpStatus(code);
  }
}

export function assert(condition: boolean, code: ServiceExceptionCode, options: any = {}): asserts condition {
  if (!condition) {
    throw new ServiceException(code, options);
  }
}

function toHttpStatus(code: ServiceExceptionCode): HttpStatus {
  switch (code) {
    case ServiceExceptionCode.DOCUMENT_NOT_FOUND:
    case ServiceExceptionCode.PREVIEW_NOT_FOUND:
      return HttpStatus.NOT_FOUND;
    default:
      return HttpStatus.BAD_REQUEST;
  }
}
