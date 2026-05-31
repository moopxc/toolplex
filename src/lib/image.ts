import type { ImageFormat } from "./types";
import { getFileExtension } from "./utils";

type CanvasCtx = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

const OUTPUT_QUALITY: Partial<Record<ImageFormat, number>> = {
  "image/jpeg": 0.92,
  "image/webp": 0.92,
};

export function inferImageMime(file: File): "image/jpeg" | "image/png" | "image/webp" {
  if (file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/webp") {
    return file.type;
  }
  const ext = getFileExtension(file.name);
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  return "image/jpeg";
}

export function configureHighQualityCanvas(ctx: CanvasCtx): void {
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
}

export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });
}

function downscaleCanvas(source: CanvasImageSource, width: number, height: number): OffscreenCanvas | HTMLCanvasElement {
  if (typeof OffscreenCanvas !== "undefined") {
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext("2d") as OffscreenCanvasRenderingContext2D;
    configureHighQualityCanvas(ctx);
    ctx.drawImage(source, 0, 0, width, height);
    return canvas;
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  configureHighQualityCanvas(ctx);
  ctx.drawImage(source, 0, 0, width, height);
  return canvas;
}

export async function blobFromCanvasSource(
  source: CanvasImageSource,
  width: number,
  height: number,
  mime: ImageFormat | string,
  options?: { fillWhite?: boolean; quality?: number }
): Promise<Blob> {
  const quality = options?.quality ?? OUTPUT_QUALITY[mime as ImageFormat];

  if (typeof OffscreenCanvas !== "undefined") {
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext("2d") as OffscreenCanvasRenderingContext2D | null;
    if (!ctx) throw new Error("Canvas context unavailable");
    configureHighQualityCanvas(ctx);
    if (options?.fillWhite && mime === "image/jpeg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
    }
    ctx.drawImage(source, 0, 0, width, height);
    return canvas.convertToBlob({ type: mime, quality });
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context unavailable");
  configureHighQualityCanvas(ctx);
  if (options?.fillWhite && mime === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
  }
  ctx.drawImage(source, 0, 0, width, height);
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))),
      mime,
      quality
    );
  });
}

/** Step down in halves when shrinking — produces sharper results than a single stretch. */
export async function resizeImageToBlob(file: File, width: number, height: number): Promise<Blob> {
  const img = await loadImageFromFile(file);
  const mime = inferImageMime(file);

  let source: CanvasImageSource = img;
  let srcW = img.naturalWidth;
  let srcH = img.naturalHeight;

  // Step down by halves while the halved size is still LARGER than the target
  // on at least one axis. This avoids upscaling from an intermediate canvas.
  if (srcW > width || srcH > height) {
    while (Math.floor(srcW / 2) >= width || Math.floor(srcH / 2) >= height) {
      const nextW = Math.floor(srcW / 2);
      const nextH = Math.floor(srcH / 2);
      // Stop if halving would make both dimensions smaller than the target
      if (nextW < width && nextH < height) break;
      srcW = nextW;
      srcH = nextH;
      source = downscaleCanvas(source, srcW, srcH);
    }
  }

  return blobFromCanvasSource(source, width, height, mime, { fillWhite: true });
}

/** Decode dcraw P6 (binary PPM) output — browsers cannot render TIFF/PPM natively. */
export function decodePpm(data: Uint8Array): ImageData {
  const magic = String.fromCharCode(data[0], data[1]);
  if (magic !== "P6" && magic !== "P5") {
    throw new Error(`Unsupported PPM format: ${magic}`);
  }
  if (magic === "P5") {
    throw new Error("ASCII PPM (P5) is not supported");
  }

  let i = 2;
  const readToken = (): string => {
    while (i < data.length && data[i] <= 0x20) {
      if (data[i] === 0x23) {
        while (i < data.length && data[i] !== 0x0a) i++;
      } else {
        i++;
      }
    }
    const start = i;
    while (i < data.length && data[i] > 0x20) i++;
    return new TextDecoder().decode(data.slice(start, i));
  };

  const imgWidth = parseInt(readToken(), 10);
  const imgHeight = parseInt(readToken(), 10);
  const maxVal = parseInt(readToken(), 10);
  if (!imgWidth || !imgHeight || !maxVal) throw new Error("Invalid PPM header");

  while (i < data.length && data[i] <= 0x20) i++;

  const pixelCount = imgWidth * imgHeight;
  const bytesPerSample = maxVal > 255 ? 2 : 1;
  const bytesPerPixel = 3 * bytesPerSample;
  const rgb = data.subarray(i, i + pixelCount * bytesPerPixel);
  if (rgb.length < pixelCount * bytesPerPixel) throw new Error("PPM data truncated");

  const scale = maxVal !== 255 ? 255 / maxVal : 1;
  const rgba = new Uint8ClampedArray(pixelCount * 4);

  if (bytesPerSample === 1) {
    for (let p = 0, r = 0; p < pixelCount; p++, r += 3) {
      rgba[p * 4] = Math.min(255, Math.round(rgb[r] * scale));
      rgba[p * 4 + 1] = Math.min(255, Math.round(rgb[r + 1] * scale));
      rgba[p * 4 + 2] = Math.min(255, Math.round(rgb[r + 2] * scale));
      rgba[p * 4 + 3] = 255;
    }
  } else {
    for (let p = 0, r = 0; p < pixelCount; p++, r += 6) {
      rgba[p * 4] = Math.min(255, Math.round(((rgb[r] << 8) | rgb[r + 1]) * scale));
      rgba[p * 4 + 1] = Math.min(255, Math.round(((rgb[r + 2] << 8) | rgb[r + 3]) * scale));
      rgba[p * 4 + 2] = Math.min(255, Math.round(((rgb[r + 4] << 8) | rgb[r + 5]) * scale));
      rgba[p * 4 + 3] = 255;
    }
  }

  return new ImageData(rgba, imgWidth, imgHeight);
}

export async function imageDataToJpegBlob(imageData: ImageData, quality: number): Promise<Blob> {
  if (typeof OffscreenCanvas !== "undefined") {
    const canvas = new OffscreenCanvas(imageData.width, imageData.height);
    const ctx = canvas.getContext("2d") as OffscreenCanvasRenderingContext2D;
    ctx.putImageData(imageData, 0, 0);
    return canvas.convertToBlob({ type: "image/jpeg", quality: quality / 100 });
  }

  const canvas = document.createElement("canvas");
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext("2d")!;
  ctx.putImageData(imageData, 0, 0);
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))),
      "image/jpeg",
      quality / 100
    );
  });
}
