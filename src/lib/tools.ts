import type { ToolMeta } from "./types";

export const tools: ToolMeta[] = [
  {
    title: "Image Compressor",
    description: "Reduce image file size without losing quality. Supports JPG, PNG, and WebP.",
    href: "/image-compressor",
    icon: "Minimize2",
    color: "bg-blue-50 text-blue-600",
  },
  {
    title: "Image Resizer",
    description: "Resize images to any dimension. Preserve aspect ratio or set custom sizes.",
    href: "/image-resizer",
    icon: "Maximize2",
    color: "bg-purple-50 text-purple-600",
  },
  {
    title: "Image Converter",
    description: "Convert between JPG, PNG, and WebP formats instantly in your browser.",
    href: "/image-converter",
    icon: "RefreshCw",
    color: "bg-green-50 text-green-600",
  },
  {
    title: "RAW to JPG",
    description: "Convert RAW camera files to JPG. Supports DNG, CR2, NEF, ARW, ORF and more.",
    href: "/raw-to-jpg",
    icon: "Camera",
    color: "bg-orange-50 text-orange-600",
  },
  {
    title: "Background Remover",
    description: "Remove image backgrounds automatically. Download as transparent PNG.",
    href: "/background-remover",
    icon: "Scissors",
    color: "bg-pink-50 text-pink-600",
  },
];
