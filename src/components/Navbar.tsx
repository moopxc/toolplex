"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Compress", href: "/image-compressor" },
  { label: "Resize", href: "/image-resizer" },
  { label: "Convert", href: "/image-converter" },
  { label: "RAW to JPG", href: "/raw-to-jpg" },
  { label: "Remove BG", href: "/background-remover" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <header className="border-b border-gray-100 bg-white sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
        >
          Toolplex
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? "page" : undefined}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                pathname === link.href
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Hamburger button */}
        <button
          className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          {open ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={cn(
          "md:hidden border-t border-gray-100 bg-white overflow-hidden transition-all duration-200",
          open ? "max-h-80" : "max-h-0"
        )}
        aria-hidden={!open}
      >
        <nav className="px-4 py-3 space-y-1" aria-label="Mobile navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? "page" : undefined}
              className={cn(
                "flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                pathname === link.href
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
