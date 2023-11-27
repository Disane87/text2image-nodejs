import express from "express";
// import { fileURLToPath } from "url";
import queryString from "query-string";
import {
  addTextToImage,
  generateImageFromOpenGraph,
} from "./image-generator.js";
import { MiddleWares } from "./api-key.middleware.js";

const app = express();
const port = 3000;

// const __filename = fileURLToPath(import.meta.url);

app.get("/generate-image/:fileName", async (req, res) => {
  const queryParams = queryString.parse(req.query as unknown as string);

  const sourceImage: string = req.query.sourceImage?.toString() || "";
  const text: string = req.query.text?.toString() || "";
  const returnType: "html" | "file" =
    (req.query.returnType?.toString() as "html" | "file") || "file";
  const debug = !!queryParams.debug || false;

  if (!sourceImage || !text) {
    res.status(400).send("Missing required parameters (sourceImage, text)");
    return;
  }

  console.log("Source image:", sourceImage);
  console.log("Text:", text);
  console.log("Return type:", returnType);
  console.log("Debug:", debug);

  const { image, mimeType } = await addTextToImage(sourceImage, text, debug);

  if (returnType === "file") {
    const buffer = Buffer.from(image.split(",")[1], "base64");

    res.writeHead(200, {
      "Content-Type": mimeType,
      "Content-Length": buffer.length,
    });
    res.end(buffer);
  }

  if (returnType === "html") {
    res.send(`<img src='${image}' />'`);
  }
});

app.get("/open-graph/:fileName", async (req, res) => {
  const url: string = req.query.url as string;
  const width: number = Number(req.query.width);
  const height: number = Number(req.query.height);
  // const text: string = req.query.text;

  const result = await generateImageFromOpenGraph(url, { width, height });

  if (result) {
    const { image, mimeType } = result;
    const buffer = Buffer.from(image.split(",")[1], "base64");

    res.writeHead(200, {
      "Content-Type": mimeType,
      "Content-Length": buffer.length,
    });
    res.end(buffer);
  } else {
    res.status(404).send("Image not found");
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

MiddleWares(app);
