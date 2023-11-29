import axios from "axios";
import * as cheerio from "cheerio";
import { readFile } from "fs/promises";
import nodeHtmlToImage from "node-html-to-image";
import path from "path";
import { Preset } from "./interfaces/presets.interface";
import { WORKDIR } from "./constants.js";
import Logger from "./logger.js";

const PUPETEER_ARGS = {
  puppeteerArgs: {
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--headless",
      "--disable-gpu",
      "--disable-dev-shm-usage",
    ],
  },
};

const TEMPLATE_PATH = path.join(WORKDIR, "templates");

export async function addTextToImage(
  imageUrl: string,
  text: string,
  preset: Preset
): Promise<{ imageBuffer: Buffer | string; mimeType: string } | null> {
  const htmlContent = await getHTML(preset);

  const htmlImage = (await nodeHtmlToImage({
    html: htmlContent,
    content: {
      imageUrl,
      text,
      preset,
    },
    ...PUPETEER_ARGS,
  })) as Buffer;

  return { imageBuffer: htmlImage, mimeType: "image/png" };
}

export async function generateImageFromOpenGraph(
  url: string,
  preset: Preset
): Promise<{ imageBuffer: Buffer | string; mimeType: string } | null> {
  try {
    // Fetch the webpage content
    const response = await axios.get(url);
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

    $('meta[property^="og:"]').each(function () {
      const property = $(this)
        .attr("property")
        ?.replace("og:", "")
        .replace(":", "_");
      const content = $(this).attr("content");
      if (property && content) {
        ogData[property] = content;
      }
    });
    Logger.debug(`OpenGraph data: ${JSON.stringify(ogData)}`, "OpenGraph");

    const htmlContent = await getHTML(preset);

    const imageBuffer = (await nodeHtmlToImage({
      html: htmlContent,
      content: ogData,
      ...PUPETEER_ARGS,
    })) as Buffer;

    return { imageBuffer, mimeType: "image/png" };
  } catch (error) {
    Logger.error(`🔥: ${error}`, "OpenGraph");
    throw new Error(error);
  }
}

async function getHTML(preset: Preset) {
  const sizes = preset.sizes;
  const headTemplate = await readFile(`${TEMPLATE_PATH}/head.hbs`, "utf8");
  const templateContent = await readFile(
    `${TEMPLATE_PATH}/${preset.template}`,
    "utf8"
  );

  const htmlContent = `<html class="h-[${sizes.height}px] w-[${sizes.width}px]">
    <head>${headTemplate}</head>
    <body class="h-[${sizes.height}px] w-[${sizes.width}px]">${templateContent}</body>
  </html>`;
  Logger.debug(`HTML content: ${htmlContent}`, "HTML");
  return htmlContent;
}
