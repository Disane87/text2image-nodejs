import express from "express";
import {
  addTextToImage,
  generateImageFromOpenGraph,
} from "./image-generator.js";
import { MiddleWares } from "./api-key.middleware.js";

const app = express();
const port = 3000;

import presets from "./config/presets.json" assert { type: "json" };
import { Presets } from "./interfaces/presets.interface.js";

app.get("/image/:preset/:fileName", async (req, res) => {
  // Route params
  const presetName: string = req.params.preset as string;

  // QueryString params
  const url: string = req.query.url as string;
  const text: string = req.query.text as string;
  const openGraph: boolean = Boolean(req.query.openGraph) || false;

  if (!presetName) {
    res.status(400).send("Missing required parameters (preset)");
    return;
  }

  if (!openGraph) {
    if (!url) {
      res.status(400).send("Missing required parameters (url)");
      return;
    }

    if (!text) {
      res.status(400).send("Missing required parameters (text)");
      return;
    }
  }

  if (!url) {
    res.status(400).send("Missing required parameters (url)");
    return;
  }

  const configPresets: Presets = presets;
  const preset = configPresets[presetName];

  if (preset && !preset) {
    res.status(400).send("Invalid preset");
    return;
  }

  console.log("Preset:", presetName, preset);

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

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

MiddleWares(app);
