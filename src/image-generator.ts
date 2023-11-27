import axios from "axios";
import {
  CanvasRenderingContext2D,
  Canvas,
  registerFont,
  loadImage,
  createCanvas,
} from "canvas";
import * as cheerio from "cheerio";
import html2canvas  from "html2canvas";
import { JSDOM } from "jsdom";

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

export async function addTextToImage(
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
  let currentLine: string[] = [];
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

export async function generateImageFromOpenGraph(
  url: string,
  sizes: { width: number; height: number }
): Promise<{ image: string; mimeType: string } | null> {
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
    console.log("OG data:", ogData);
    const ogHtml = `<img src="${ogData.image}" />`;

    const dom = new JSDOM(`<!DOCTYPE html><div id="og">${ogHtml}</div>`);

    const htmlCanvas = await html2canvas(
      dom.window.document.querySelector("#og")
    );
    const dataUrl = htmlCanvas.toDataURL();

    return { image: dataUrl, mimeType: "image/png" };

    // // Create an image based on OpenGraph data
    // const canvas = createCanvas(sizes.width, sizes.height);
    // const ctx = canvas.getContext("2d");

    // // Set background color
    // ctx.fillStyle = "#ffffff";
    // ctx.fillRect(0, 0, canvas.width, canvas.height);

    // // Draw OpenGraph data onto the canvas
    // ctx.font = "30px Arial";
    // ctx.fillStyle = "#000000";
    // ctx.fillText(ogData.title || "No title available", 50, 500);

    // ctx.font = "12px Arial";
    // ctx.fillText(ogData.description || "No description available", 50, 650);

    // // Fetch the og:image using axios
    // const imageResponse = await axios.get(ogData.image, {
    //   responseType: "arraybuffer",
    // });
    // const imageBuffer = Buffer.from(imageResponse.data, "binary");
    // const imageAspectRatio =
    //   Number(ogData.image_width) / Number(ogData.image_height);

    // console.log("Image aspect ratio:", imageAspectRatio);

    // // Draw OpenGraph image onto the canvas
    // const ogImage = await loadImage(imageBuffer);
    // ctx.drawImage(ogImage, 0, 0, canvas.width, canvas.width / imageAspectRatio);

    // // Save the canvas as an image file
    // //   const imageBuffer = canvas.toBuffer('image/png');
    // // Save or return the image buffer
    // const dataUrl = canvas.toDataURL();

    // return { image: dataUrl, mimeType: "image/png" };
  } catch (error) {
    console.error("Error:", error);
    // Handle errors appropriately
    return null;
  }
}
