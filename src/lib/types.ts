export interface ToolMeta {
  title: string;
  description: string;
  href: string;
  icon: string;
  color: string;
}

export type ImageFormat = "image/jpeg" | "image/png" | "image/webp";

export interface ProcessedImage {
  blob: Blob;
  url: string;
  size: number;
  width?: number;
  height?: number;
}
