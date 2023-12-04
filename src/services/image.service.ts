import { Injectable } from "@nestjs/common";
import nodeHtmlToImage from "node-html-to-image";
import { ImageGenerator } from "src/interfaces/image-generator.interface";
import { TemplateData } from "src/interfaces/template-data.interface";

@Injectable()
export class ImageService {
  constructor() {}

  private puppeteerArgs = {
    headless: true,
    args: [
      `--no-sandbox`,
      `--disable-setuid-sandbox`,
      `--headless`,
      `--disable-gpu`,
      `--disable-dev-shm-usage`,
    ],
  };

  async generateImageWithData(
    data: TemplateData,
    html: string,
  ): Promise<ImageGenerator | null> {
    const htmlImage = (await nodeHtmlToImage({
      html: html,
      content: {
        ...data,
      },
      puppeteerArgs: this.puppeteerArgs,
    })) as Buffer;

    return { imageBuffer: htmlImage, mimeType: `image/png` };
  }
}
