import type { Metadata } from "next";
import Link from "next/link";
import {
  Minimize2,
  Maximize2,
  RefreshCw,
  Camera,
  Scissors,
  Zap,
  Shield,
  Smartphone,
} from "lucide-react";
import { tools } from "@/lib/tools";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Toolplex – Free Online Image Tools",
  description:
    "Compress, resize, convert, and edit images for free. No uploads to servers. All processing happens in your browser.",
};

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Minimize2,
  Maximize2,
  RefreshCw,
  Camera,
  Scissors,
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="bg-gradient-to-b from-blue-50 to-white py-16 sm:py-24 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-sm font-medium px-3 py-1 rounded-full mb-6">
              <Zap className="w-4 h-4" />
              100% Free · No Sign-up Required
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight">
              Free Online Image Tools
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Compress, resize, convert, and edit images directly in your browser.
              Fast, private, and completely free.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/image-compressor"
                className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start Compressing
              </Link>
              <Link
                href="/background-remover"
                className="bg-white text-gray-700 font-semibold px-6 py-3 rounded-lg border border-gray-300 hover:border-blue-400 hover:text-blue-600 transition-colors"
              >
                Remove Background
              </Link>
            </div>
          </div>
        </section>

        {/* Tools Grid */}
        <section className="max-w-6xl mx-auto px-4 py-16" aria-labelledby="tools-heading">
          <h2 id="tools-heading" className="text-2xl font-bold text-gray-900 text-center mb-10">
            All Image Tools
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => {
              const Icon = iconMap[tool.icon];
              return (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="group p-6 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${tool.color}`}>
                    {Icon && <Icon className="w-6 h-6" />}
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {tool.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                    {tool.description}
                  </p>
                  <span className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    Use tool →
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Features */}
        <section className="bg-gray-50 py-16 px-4" aria-labelledby="features-heading">
          <div className="max-w-4xl mx-auto">
            <h2 id="features-heading" className="text-2xl font-bold text-gray-900 text-center mb-10">
              Why Toolplex?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">100% Private</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Your images never leave your device. All processing happens locally in your browser.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Lightning Fast</h3>
                <p className="mt-2 text-sm text-gray-500">
                  No server round-trips. Process images instantly with client-side technology.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Works Everywhere</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Fully responsive and optimized for mobile, tablet, and desktop.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <div>
            <span className="font-semibold text-gray-900">Toolplex</span>
            <span className="ml-2">© {new Date().getFullYear()} Free online image tools.</span>
          </div>
          <nav className="flex gap-6" aria-label="Footer navigation">
            <Link href="/about" className="hover:text-gray-900 transition-colors">About</Link>
            <Link href="/privacy" className="hover:text-gray-900 transition-colors">Privacy Policy</Link>
            <Link href="/contact" className="hover:text-gray-900 transition-colors">Contact</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
