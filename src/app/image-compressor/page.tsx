import type { Metadata } from "next";
import { ImageCompressorTool } from "./ImageCompressorTool";
import { ToolLayout } from "@/components/ToolLayout";
import { FaqSection } from "@/components/FaqSection";

export const metadata: Metadata = {
  title: "Image Compressor – Reduce Image File Size Free",
  description:
    "Compress JPG, PNG, and WebP images online for free. Reduce file size without losing quality. No upload required – all processing in your browser.",
};

const faqs = [
  {
    question: "How does the image compressor work?",
    answer:
      "Our compressor uses browser-native Canvas API and the browser-image-compression library to reduce file size by adjusting quality and optionally resizing. Your image never leaves your device.",
  },
  {
    question: "What image formats are supported?",
    answer:
      "We support JPG/JPEG, PNG, and WebP formats. GIF files can be uploaded but will be converted to the original format during compression.",
  },
  {
    question: "Will compression reduce image quality?",
    answer:
      "At higher quality settings (80–100), the difference is barely noticeable. Lower settings (below 60) will show visible quality loss but achieve much smaller file sizes.",
  },
  {
    question: "Is there a file size limit?",
    answer:
      "You can compress images up to 50MB. For very large files, processing may take a few seconds.",
  },
  {
    question: "Are my images stored anywhere?",
    answer:
      "No. All compression happens entirely in your browser. Your images are never uploaded to any server.",
  },
];

export default function ImageCompressorPage() {
  return (
    <ToolLayout
      title="Image Compressor"
      description="Reduce image file size without losing quality. Supports JPG, PNG, and WebP. All processing happens in your browser."
      currentHref="/image-compressor"
    >
      <ImageCompressorTool />
      <FaqSection items={faqs} />
    </ToolLayout>
  );
}
