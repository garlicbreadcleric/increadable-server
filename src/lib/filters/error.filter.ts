import { ArgumentsHost, ExceptionFilter } from "@nestjs/common";
import { ServiceException } from "../errors/service.error";

export class ErrorFilter implements ExceptionFilter<ServiceException> {
  catch(exception: ServiceException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    response.status(exception).json({
      ...(exception.options ?? {}),
      code: exception.code,
    });
  }
}
