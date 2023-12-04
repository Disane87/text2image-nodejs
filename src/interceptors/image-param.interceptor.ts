import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  RequestMethod,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { PresetService } from "src/services/preset/preset.service";

@Injectable()
export class ImageInterceptor implements NestInterceptor {
  constructor(private readonly presetService: PresetService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const http = context.switchToHttp();
    const request = http.getRequest();
    // const { url, openGraphUrl, text } = request.query;
    const { preset, fileName } = request.params;
    const { data } = request.body;

    // const openGraphBool = parseBoolean(openGraph);

    if (request.method === RequestMethod[RequestMethod.POST] && data == null) {
      Logger.error(
        `Missing required parameters (data) when using method POST`,
        `ImageInterceptor`,
      );
      throw new HttpException(
        `Missing required parameters (data) when using method POST`,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!preset) {
      Logger.error(`Missing required parameters (preset)`, `ImageInterceptor`);
      throw new HttpException(
        `Missing required parameters (preset)`,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!fileName) {
      Logger.error(
        `Missing required parameters (fileName)`,
        `ImageInterceptor`,
      );
      throw new HttpException(
        `Missing required parameters (fileName)`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return next.handle();
  }
}
