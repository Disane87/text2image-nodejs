import express from "express";
import {
  Canvas,
  CanvasRenderingContext2D,
  createCanvas,
  loadImage,
  registerFont,
} from "canvas";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import queryString from "query-string";

const app = express();
const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function drawDebugLines(ctx: CanvasRenderingContext2D, canvas: Canvas) {
  var centerX = canvas.width / 2;
  var centerY = canvas.height / 2;
  // Draw lines through the center of each axis
  ctx.beginPath();

  // Horizontal line
  ctx.moveTo(0, centerY);
  ctx.lineTo(canvas.width, centerY);

  // Vertical line
  ctx.moveTo(centerX, 0);
  ctx.lineTo(centerX, canvas.height);

  // Set line color
  ctx.strokeStyle = "#FF0000"; // Red color

  // Set line width
  ctx.lineWidth = 2;

  // Draw the lines
  ctx.stroke();

  // Close the path
  ctx.closePath();
}

async function calculateTextMetrics(
  ctx: any,
  text: string,
  fontSize: number
): Promise<{ width: number; height: number }> {
  ctx.font = `${fontSize}px Verdana`;
  const textMetrics = ctx.measureText(text);
  const height = fontSize; // A rough approximation for height
  return { width: textMetrics.width, height };
}

async function addTextToImage(
  sourceImage: string,
  text: string,
  debug: boolean = false,
  fontName: string = "LuckiestGuy.ttf",
  txtColor: string = "#FFFFFF",
  borderColor: string = "#000000",
  borderWidth: number = 15
) {
  // Insert a \n after every 7th word
  const words = text.split(" ");
  const wordsPerLine = 7;
  const lines = [];
  let currentLine = [];
  for (const word of words) {
    if (currentLine.length < wordsPerLine) {
      currentLine.push(word);
    } else {
      lines.push(currentLine.join(" "));
      currentLine = [word];
    }
  }
  lines.push(currentLine.join(" "));
  const textWithNewLines = lines.join("\n");

  const imgFraction: number = 1;
  const marginPercentageX: number = 0.05; // 5% margin on each side
  const marginPercentageY: number = 0.05;

  registerFont(`fonts/${fontName}`, { family: fontName });

  const image = await loadImage(sourceImage);
  const canvas = createCanvas(image.width, image.height); // Set the canvas size to match the image
  const ctx = canvas.getContext("2d");

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Draw image on the canvas
  ctx.drawImage(image, 0, 0);

  console.log("Canvas size:", canvas.width, "x", canvas.height);

  let fontSize = 300;
  let textFits = false;

  while (!textFits && fontSize <= 300) {
    const textMetrics = await calculateTextMetrics(
      ctx,
      textWithNewLines,
      fontSize
    );

    const targetTextWidth =
      imgFraction * (canvas.width - 2 * canvas.width * marginPercentageX);
    const targetTextHeight =
      canvas.height - 2 * canvas.height * marginPercentageY;

    if (textMetrics.width <= targetTextWidth && fontSize <= targetTextHeight) {
      textFits = true;
    } else {
      fontSize--; // Decrease font size if text doesn't fit
    }
  }

  const textMetrics = await calculateTextMetrics(
    ctx,
    textWithNewLines,
    fontSize
  );

  // Calculate the position to center the text vertically and horizontally
  const textPosX = canvas.width / 2;
  const textPosY = canvas.height / 2;

  console.log("Text size: x=", textMetrics.width, " y=", textMetrics.height);
  console.log("Text positions: x=", textPosX, " y=", textPosY);

  if (debug) {
    drawDebugLines(ctx, canvas);
  }

  const lineMargin = 20;

  console.log("Font size:", fontSize);
  console.log("Font name:", fontName);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineMetrics = await calculateTextMetrics(ctx, line, fontSize);

    // Calculate total text height
    const totalTextHeight =
      lines.length * (lineMetrics.height + lineMargin) - lineMargin;

    // Calculate starting y position for centering
    const startY = textPosY - totalTextHeight / 2;

    // Calculate y position for each line
    const linePosY =
      startY + i * (lineMetrics.height + lineMargin) + lineMetrics.height / 2;

    // Shadow
    ctx.shadowColor = "black";
    ctx.shadowOffsetX = 10;
    ctx.shadowOffsetY = 10;
    ctx.shadowBlur = 15;

    // Draw border around the text
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = borderWidth;
    ctx.font = `${fontSize}px "${fontName}"`;
    ctx.strokeText(line, textPosX, linePosY);

    // Draw text on the canvas
    ctx.fillStyle = txtColor;
    ctx.font = `${fontSize}px "${fontName}"`;
    ctx.fillText(line, textPosX, linePosY);
  }

  // Convert canvas to image
  const dataUrl = canvas.toDataURL();
  const mimeType = dataUrl.split(";")[0].split(":")[1];
  // const binaryImage = dataUrl.replace(/^data:image\/\w+;base64,/, "");

  return { image: dataUrl, mimeType };
}

app.get("/generate-image", async (req, res) => {
  const queryParams = queryString.parse(req.query);

  const sourceImage: string = req.query.sourceImage;
  const text: string = req.query.text;
  const returnType: "html" | "file" = req.query.returnType || "file";
  const debug = !!queryParams.debug || false;

  const apiKeyQS = req.query.apiKey;
  const apiKeyEnv = process.env.API_KEY;

  if (apiKeyQS != apiKeyEnv) {
    res
      .status(402)
      .send("⚠️ Invalid API key. Please provide a valid API key. ");
    return;
  }

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

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});
