import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Privacy Policy – Toolplex",
  description: "Toolplex privacy policy. Your images never leave your device.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: January 2025</p>
        <div className="space-y-6 text-gray-600">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Your Images Stay on Your Device</h2>
            <p>
              All image processing on Toolplex happens entirely in your browser. Your images are
              never uploaded to our servers or any third-party servers. We do not have access to
              your files.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Data We Collect</h2>
            <p>
              We do not collect any personal data. We do not use cookies for tracking. We do not
              use analytics services that track individual users.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Third-Party Services</h2>
            <p>
              Toolplex is hosted on Vercel. Vercel may collect standard server logs (IP addresses,
              request timestamps) as part of their infrastructure. Please refer to{" "}
              <a
                href="https://vercel.com/legal/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Vercel&apos;s Privacy Policy
              </a>{" "}
              for details.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">AI Model Downloads</h2>
            <p>
              The Background Remover tool downloads an AI model from a CDN on first use. This
              download is cached in your browser. No image data is sent during this process.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Contact</h2>
            <p>
              If you have questions about this privacy policy, please{" "}
              <Link href="/contact" className="text-blue-600 hover:underline">contact us</Link>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
