import type { Metadata } from "next";
import { BackgroundRemoverTool } from "./BackgroundRemoverTool";
import { ToolLayout } from "@/components/ToolLayout";
import { FaqSection } from "@/components/FaqSection";

export const metadata: Metadata = {
  title: "Background Remover – Remove Image Background Free Online",
  description:
    "Remove image backgrounds automatically for free. Download as transparent PNG. AI-powered, runs entirely in your browser.",
};

const faqs = [
  {
    question: "How does the background remover work?",
    answer:
      "We use an AI model (@imgly/background-removal) that runs entirely in your browser using WebAssembly. No image is ever sent to a server.",
  },
  {
    question: "What image formats are supported?",
    answer:
      "JPG, PNG, and WebP images are supported. Output can be WebP (recommended, ~70% smaller) or PNG (lossless, max compatibility).",
  },
  {
    question: "Why does it take a while the first time?",
    answer:
      "The first time you use the tool, the AI model (~10MB) is downloaded and cached in your browser. Subsequent uses are much faster.",
  },
  {
    question: "What types of images work best?",
    answer:
      "The AI works best on images with clear subjects like people, products, animals, and objects against distinct backgrounds. Complex scenes with similar colors may have less accurate results.",
  },
  {
    question: "Is my image uploaded to any server?",
    answer:
      "No. The entire AI model runs locally in your browser. Your images never leave your device.",
  },
];

export default function BackgroundRemoverPage() {
  return (
    <ToolLayout
      title="Background Remover"
      description="Remove image backgrounds automatically using AI. Download as transparent PNG. Runs entirely in your browser."
      currentHref="/background-remover"
    >
      <BackgroundRemoverTool />
      <FaqSection items={faqs} />
    </ToolLayout>
  );
}
