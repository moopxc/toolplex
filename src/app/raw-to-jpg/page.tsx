import type { Metadata } from "next";
import { RawToJpgTool } from "./RawToJpgTool";
import { ToolLayout } from "@/components/ToolLayout";
import { FaqSection } from "@/components/FaqSection";

export const metadata: Metadata = {
  title: "RAW to JPG Converter – Convert DNG, CR2, NEF, ARW Online Free",
  description:
    "Convert RAW camera files (DNG, CR2, NEF, ARW, ORF, RW2 and more) to JPG online for free. Powered by dcraw. No upload required — runs in your browser.",
};

const faqs = [
  {
    question: "What RAW formats are supported?",
    answer:
      "DNG, CR2, CR3 (Canon), NEF (Nikon), ARW (Sony), ORF (Olympus), RW2 (Panasonic), PEF (Pentax), RAF (Fujifilm), SRW (Samsung), and more — powered by the dcraw library.",
  },
  {
    question: "How does the conversion work?",
    answer:
      "We use dcraw — the industry-standard RAW decoder compiled to JavaScript — running entirely in your browser. Your file is never uploaded anywhere.",
  },
  {
    question: "Why does it take a moment to start?",
    answer:
      "The dcraw decoder (~700KB) loads once when you first use the tool. After that it's cached and instant.",
  },
  {
    question: "What quality is the output JPG?",
    answer:
      "Default is 95% quality — excellent results with reasonable file size. You can adjust this with the quality slider before converting.",
  },
  {
    question: "Is my file uploaded to a server?",
    answer:
      "No. Everything runs in your browser using WebAssembly/JavaScript. Your RAW files never leave your device.",
  },
];

export default function RawToJpgPage() {
  return (
    <ToolLayout
      title="RAW to JPG Converter"
      description="Convert RAW camera files to JPG. Supports DNG, CR2, NEF, ARW, ORF, RW2 and more. Runs entirely in your browser."
      currentHref="/raw-to-jpg"
    >
      <RawToJpgTool />
      <FaqSection items={faqs} />
    </ToolLayout>
  );
}
