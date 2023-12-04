/*
https://docs.nestjs.com/providers#services
*/
import * as cheerio from "cheerio";
import { Injectable, Logger } from "@nestjs/common";
import { firstValueFrom } from "rxjs";
import { HttpService } from "@nestjs/axios";

@Injectable()
export class OpenGraphService {
    constructor(private readonly httpsService: HttpService) {}
    public async getOpenGraphMetadata(url: string) {
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
            return ogData;
        } catch (error) {
            Logger.error(`🔥: ${error}`, `OpenGraph`);
            throw new Error(error);
        }
    }

    private async readUrl(url: string) {
        return firstValueFrom(this.httpsService.get(url));
    }
}
