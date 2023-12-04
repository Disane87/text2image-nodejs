import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  Post,
  Query,
  Req,
  Res,
  StreamableFile,
  UseInterceptors,
} from "@nestjs/common";

import { ImageService } from "src/services/image.service";
import type { Request, Response } from "express";
import { ImageInterceptor } from "src/interceptors/image-param.interceptor";
import { GetPresetHtmlPipe } from "src/pipes/get-preset.html.pipe";
import { GetPresetPipe } from "src/pipes/get-preset.pipe";
import { Preset } from "src/interfaces/presets.interface";
import { OpenGraphService } from "src/services/open-graph.service";
import { TemplateData } from "src/interfaces/template-data.interface";

@Controller(`image`)
export class ImageController {
  constructor(
    private readonly imageService: ImageService,
    private readonly openGraphService: OpenGraphService,
  ) {}

  @Get(`:preset/:fileName`)
  @UseInterceptors(ImageInterceptor)
  async returnImage(
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
    @Param(`preset`, GetPresetPipe) preset: Preset,
    @Param(`preset`, GetPresetHtmlPipe) presetHtml: string,
    @Query(`url`) url: string,
    @Query(`openGraphUrl`) openGraphUrl: string,
  ): Promise<StreamableFile> {
    const data: TemplateData = {
      url,
      queryParams: req.query as { [key: string]: unknown },
    };

    if (openGraphUrl) {
      data.openGraph =
        await this.openGraphService.getOpenGraphMetadata(openGraphUrl);
    }

    return await this.generateImage(data, presetHtml, res);
  }

  @Post(`:preset/:fileName`)
  @UseInterceptors(ImageInterceptor)
  async returnImagePost(
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
    @Param(`preset`, GetPresetPipe) preset: Preset,
    @Param(`preset`, GetPresetHtmlPipe) presetHtml: string,
    @Query(`url`) url: string,
    @Query(`openGraphUrl`) openGraphUrl: string,
    @Body(`data`) postData: { [key: string]: unknown },
  ): Promise<StreamableFile> {
    const data: TemplateData = {
      url,
      queryParams: req.query as { [key: string]: unknown },
      data: postData,
    };

    if (openGraphUrl) {
      data.openGraph =
        await this.openGraphService.getOpenGraphMetadata(openGraphUrl);
    }

    return await this.generateImage(data, presetHtml, res);
  }

  private async generateImage(
    data: TemplateData,
    presetHtml: string,
    res: Response,
  ) {
    Object.keys(data.queryParams).includes(`apiKey`) &&
      delete data.queryParams.apiKey;

    const result = await this.imageService.generateImageWithData(
      data,
      presetHtml,
    );

    Logger.debug(`Data: ${JSON.stringify(data)}`, `ImageController`);

    if (result) {
      const { imageBuffer, mimeType } = result;
      res.set({
        "Content-Type": mimeType,
      });
      return new StreamableFile(imageBuffer);
    } else {
      throw new HttpException(`Image not found`, HttpStatus.BAD_REQUEST);
    }
  }
}
