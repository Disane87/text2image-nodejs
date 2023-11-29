import express from "express";
import {
  addTextToImage,
  generateImageFromOpenGraph,
} from "./image-generator.js";
import { MiddleWares } from "./middlewares.js";

import { ENVIRONMENT, EXPRESS_PORT, WORKDIR } from "./constants.js";
import Logger from "./logger.js";
import { checkAndCopyFolders, getPresets } from "./helpers.js";
import { Presets } from "./interfaces/presets.interface.js";

const app = express();

Logger.info(`WORKDIR: ${WORKDIR}`, "Runtime");
Logger.info(`ENVIRONMENT: ${ENVIRONMENT}`, "Runtime");

app.get("/", async (req, res) => {
  res.send(
    `Please check out the documentation at <a href="https://github.com/Disane87/text2image-nodejs">https://github.com/Disane87/text2image-nodejs</a> for more info about usage.`
  );
});

app.get("/image/:preset/:fileName", async (req, res) => {
  // Route params
  const presetName: string = req.params.preset as string;

  // QueryString params
  const url: string = req.query.url as string;
  const text: string = req.query.text as string;
  const openGraph: boolean = Boolean(req.query.openGraph) || false;

  if (!presetName) {
    res.status(400).send("Missing required parameters (preset)");
    Logger.error("Missing required parameters (preset)", "Request");
    return;
  }

  if (!openGraph) {
    if (!url) {
      res.status(400).send("Missing required parameters (url)");
      Logger.error("Missing required parameters (url)", "Request");
      return;
    }

    if (!text) {
      res.status(400).send("Missing required parameters (text)");
      Logger.error("Missing required parameters (text)", "Request");
      return;
    }
  }

  if (!url) {
    res.status(400).send("Missing required parameters (url)");
    Logger.error("Missing required parameters (url)", "Request");
    return;
  }

  const configPresets: Presets = await getPresets();
  const preset = configPresets[presetName];

  if (preset && !preset) {
    res.status(400).send("Invalid preset");
    Logger.error("Invalid preset", "Request");
    return;
  }

  Logger.info(`Preset name: ${presetName}`, "Request");
  Logger.debug(`Preset: ${JSON.stringify(preset)}`, "Request");

  let result: {
    imageBuffer: string | Buffer;
    mimeType: string;
  } | null = null;

  if (openGraph) {
    result = await generateImageFromOpenGraph(url, preset);
  } else {
    result = await addTextToImage(url, text, preset);
  }

  if (result) {
    const { imageBuffer, mimeType } = result;

    res.writeHead(200, { "Content-Type": mimeType });
    res.end(imageBuffer, "binary");
  } else {
    res.status(404).send("Image not found");
  }
});

app.listen(EXPRESS_PORT, () => {
  Logger.info(`Running at http://localhost:${EXPRESS_PORT}`, "Server");
});

await checkAndCopyFolders();
MiddleWares(app);
