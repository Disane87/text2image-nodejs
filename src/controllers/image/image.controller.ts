import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  ParseBoolPipe,
  Query,
  Res,
  StreamableFile,
} from "@nestjs/common";

import { ImageService } from "src/services/image.service";
import { PresetService } from "src/services/preset/preset.service";
import type { Response } from "express";

@Controller(`image`)
export class ImageController {
  constructor(
    private readonly imageService: ImageService,
    private readonly presetService: PresetService,
  ) {}

  @Get(`:preset/:fileName`)
  async generateImage(
    @Res({ passthrough: true }) res: Response,
    @Param(`preset`) presetName: string,
    @Param(`fileName`) fileName: string,
    @Query(`url`) url: string,
    @Query(`openGraph`, ParseBoolPipe) openGraph: boolean,
    @Query(`text`) text?: string,
  ): Promise<StreamableFile> {
    if (!presetName) {
      Logger.error(`Missing required parameters (preset)`, `Request`);
      throw new HttpException(
        `Missing required parameters (preset)`,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!fileName) {
      Logger.error(`Missing required parameters (fileName)`, `Request`);
      throw new HttpException(
        `Missing required parameters (fileName)`,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!openGraph) {
      if (!url) {
        Logger.error(`Missing required parameters (url)`, `Request`);
        throw new HttpException(
          `Missing required parameters (url)`,
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!text) {
        Logger.error(`Missing required parameters (text)`, `Request`);
        throw new HttpException(
          `Missing required parameters (text)`,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    if (!url) {
      Logger.error(`Missing required parameters (url)`, `Request`);
      throw new HttpException(
        `Missing required parameters (url)`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const preset = await this.presetService.getPreset(presetName);
    Logger.log(`Preset name: ${presetName}`, `Request`);
    Logger.debug(`Preset: ${JSON.stringify(preset)}`, `Request`);

    if (preset.openGraph != openGraph) {
      throw new HttpException(
        `Preset ${presetName} not suitable for using with OpenGraph. Check presets`,
        HttpStatus.BAD_REQUEST,
      );
    }

    let result: {
      imageBuffer: Buffer;
      mimeType: string;
    } | null = null;

    const presetHtml = await this.presetService.getPresetTemplateAsHtml(preset);
    if (openGraph) {
      result = await this.imageService.generateImageFromOpenGraph(
        url,
        presetHtml,
      );
    } else {
      result = await this.imageService.addTextToImage(url, text, presetHtml);
    }

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
