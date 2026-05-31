import type { Metadata } from "next";
import { ImageConverterTool } from "./ImageConverterTool";
import { ToolLayout } from "@/components/ToolLayout";
import { FaqSection } from "@/components/FaqSection";

export const metadata: Metadata = {
  title: "Image Converter – Convert JPG, PNG, WebP Online Free",
  description:
    "Convert images between JPG, PNG, and WebP formats instantly in your browser. Free, fast, and private. No upload required.",
};

const faqs = [
  {
    question: "What formats can I convert between?",
    answer:
      "You can convert between JPG (JPEG), PNG, and WebP formats. Simply upload your image and select the desired output format.",
  },
  {
    question: "Will converting to JPG lose transparency?",
    answer:
      "Yes. JPG does not support transparency. If your PNG has a transparent background, it will be replaced with a white background when converting to JPG.",
  },
  {
    question: "Why convert to WebP?",
    answer:
      "WebP typically produces 25–35% smaller files than JPG at equivalent quality, making it ideal for web use. Most modern browsers support WebP.",
  },
  {
    question: "Why convert to PNG?",
    answer:
      "PNG is a lossless format that supports transparency. It's ideal for logos, icons, and images where you need a transparent background.",
  },
  {
    question: "Is there a file size limit?",
    answer:
      "You can convert images up to 50MB. All conversion happens in your browser with no server uploads.",
  },
];

export default function ImageConverterPage() {
  return (
    <ToolLayout
      title="Image Converter"
      description="Convert images between JPG, PNG, and WebP formats instantly. All processing happens in your browser."
      currentHref="/image-converter"
    >
      <ImageConverterTool />
      <FaqSection items={faqs} />
    </ToolLayout>
  );
}
