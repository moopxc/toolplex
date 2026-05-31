import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "About Toolplex",
  description: "Learn about Toolplex – free online image tools that run entirely in your browser.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">About Toolplex</h1>
        <div className="space-y-4 text-gray-600">
          <p>
            Toolplex is a collection of free, fast, and private online image tools. Our goal is
            simple: give everyone access to powerful image editing without requiring software
            installation, account creation, or payment.
          </p>
          <p>
            Every tool processes images directly in your browser. Your files are never uploaded to
            any server — they stay completely private, and processing is as fast as your device allows.
          </p>
          <h2 className="text-xl font-semibold text-gray-900 mt-8">Our Tools</h2>
          <ul className="space-y-2">
            <li><Link href="/image-compressor" className="text-blue-600 hover:underline">Image Compressor</Link> – Reduce file size without losing quality</li>
            <li><Link href="/image-resizer" className="text-blue-600 hover:underline">Image Resizer</Link> – Resize to any dimension</li>
            <li><Link href="/image-converter" className="text-blue-600 hover:underline">Image Converter</Link> – Convert between JPG, PNG, and WebP</li>
            <li><Link href="/raw-to-jpg" className="text-blue-600 hover:underline">RAW to JPG</Link> – Convert camera RAW files (DNG, CR2, NEF, ARW…)</li>
            <li><Link href="/background-remover" className="text-blue-600 hover:underline">Background Remover</Link> – AI-powered background removal</li>
          </ul>
          <h2 className="text-xl font-semibold text-gray-900 mt-8">Technology</h2>
          <p>
            Toolplex is built with Next.js 16, TypeScript, and Tailwind CSS. Image processing uses
            the browser Canvas API, OffscreenCanvas, WebAssembly, and open-source libraries including
            dcraw (RAW decoding) and ISNet (background removal AI).
          </p>
        </div>
      </main>
    </div>
  );
}
