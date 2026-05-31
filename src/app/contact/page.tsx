import type { Metadata } from "next";
import Link from "next/link";
import { Mail } from "lucide-react";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Contact – Toolplex",
  description: "Get in touch with the Toolplex team.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Contact</h1>
        <p className="text-gray-600 mb-8">
          Have a question, suggestion, or found a bug? We&apos;d love to hear from you.
        </p>
        <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Mail className="w-6 h-6 text-blue-600" aria-hidden="true" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Email Us</p>
            <a href="mailto:hello@toolplex.app" className="text-blue-600 hover:underline text-sm">
              hello@toolplex.app
            </a>
          </div>
        </div>
        <p className="mt-6 text-sm text-gray-500">We typically respond within 1–2 business days.</p>
        <p className="mt-4 text-sm text-gray-500">
          You can also browse our{" "}
          <Link href="/about" className="text-blue-600 hover:underline">About page</Link>{" "}
          or read our{" "}
          <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>.
        </p>
      </main>
    </div>
  );
}
