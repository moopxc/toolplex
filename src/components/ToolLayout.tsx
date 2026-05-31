import React from "react";
import Link from "next/link";
import { tools } from "@/lib/tools";
import { Navbar } from "@/components/Navbar";

interface ToolLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
  currentHref: string;
}

export function ToolLayout({
  children,
  title,
  description,
  currentHref,
}: ToolLayoutProps) {
  const otherTools = tools.filter((t) => t.href !== currentHref);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Tool heading */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{title}</h1>
          <p className="mt-2 text-gray-600">{description}</p>
        </div>

        {/* Tool content */}
        {children}

        {/* Other tools */}
        <section className="mt-16" aria-labelledby="other-tools-heading">
          <h2 id="other-tools-heading" className="text-lg font-semibold text-gray-900 mb-4">
            Other Free Tools
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {otherTools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                {tool.title}
              </Link>
            ))}
          </div>
        </section>
      </main>

      <footer className="mt-16 border-t border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Toolplex. Free online image tools.</p>
          <nav className="flex gap-4" aria-label="Footer navigation">
            <Link href="/about" className="hover:text-gray-900 transition-colors">About</Link>
            <Link href="/privacy" className="hover:text-gray-900 transition-colors">Privacy Policy</Link>
            <Link href="/contact" className="hover:text-gray-900 transition-colors">Contact</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
