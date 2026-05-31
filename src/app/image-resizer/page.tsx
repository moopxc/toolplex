import type { Metadata } from "next";
import { ImageResizerTool } from "./ImageResizerTool";
import { ToolLayout } from "@/components/ToolLayout";
import { FaqSection } from "@/components/FaqSection";

export const metadata: Metadata = {
  title: "Image Resizer – Resize Images Online Free",
  description:
    "Resize images to any dimension online for free. Set custom width and height, preserve aspect ratio. No upload needed – all in your browser.",
};

const faqs = [
  {
    question: "How do I resize an image without distortion?",
    answer:
      "Enable the 'Preserve Aspect Ratio' option. When you change the width, the height will automatically adjust to maintain the original proportions.",
  },
  {
    question: "What is the maximum output size?",
    answer:
      "You can resize images up to 8000×8000 pixels. Very large outputs may take a moment to process.",
  },
  {
    question: "Will resizing reduce image quality?",
    answer:
      "Downscaling (making smaller) generally preserves quality well. Upscaling (making larger) may introduce some blurriness as pixels are interpolated.",
  },
  {
    question: "What formats are supported?",
    answer:
      "JPG, PNG, and WebP images are supported. The output format matches the input format.",
  },
  {
    question: "Is my image uploaded to a server?",
    answer:
      "No. Resizing is done entirely in your browser using the Canvas API. Your image stays on your device.",
  },
];

export default function ImageResizerPage() {
  return (
    <ToolLayout
      title="Image Resizer"
      description="Resize images to any dimension. Set custom width and height, with optional aspect ratio preservation."
      currentHref="/image-resizer"
    >
      <ImageResizerTool />
      <FaqSection items={faqs} />
    </ToolLayout>
  );
}
