import { Injectable, Logger } from "@nestjs/common";
import * as cheerio from "cheerio";
import nodeHtmlToImage from "node-html-to-image";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { ImageGenerator } from "src/interfaces/image-generator.interface";

@Injectable()
export class ImageService {
    constructor(private httpsService: HttpService) {}

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

    async addTextToImage(
        imageUrl: string,
        text: string,
        html: string,
    ): Promise<ImageGenerator | null> {
        const htmlImage = (await nodeHtmlToImage({
            html: html,
            content: {
                imageUrl,
                text,
            },
            puppeteerArgs: this.puppeteerArgs,
        })) as Buffer;

        return { imageBuffer: htmlImage, mimeType: `image/png` };
    }

    private async readUrl(url: string) {
        return firstValueFrom(this.httpsService.get(url));
    }

    async generateImageFromOpenGraph(
        url: string,
        htmlTemplate: string,
    ): Promise<ImageGenerator | null> {
        try {
            // Fetch the webpage content
            const response = await this.readUrl(url);
            const html = response.data;

            // Parse HTML using cheerio
            const $ = cheerio.load(html);

            // Extract OpenGraph data
            const ogData: {
                [key: string]: string | null;
            } = {
                title: null,
                description: null,
            };

            $(`meta[property^="og:"]`).each(function () {
                const property = $(this)
                    .attr(`property`)
                    ?.replace(`og:`, ``)
                    .replace(`:`, `_`);
                const content = $(this).attr(`content`);
                if (property && content) {
                    ogData[property] = content;
                }
            });
            Logger.debug(
                `OpenGraph data: ${JSON.stringify(ogData)}`,
                `OpenGraph`,
            );

            const imageBuffer = (await nodeHtmlToImage({
                html: htmlTemplate,
                content: ogData,
                puppeteerArgs: this.puppeteerArgs,
            })) as Buffer;

            return { imageBuffer, mimeType: `image/png` };
        } catch (error) {
            Logger.error(`🔥: ${error}`, `OpenGraph`);
            throw new Error(error);
        }
    }
}
