import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import localFont from "next/font/local"

import "./globals.css"

const sans = Geist({ variable: "--font-geist-sans", subsets: ["latin"], display: "swap" })
const mono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap" })

/*
 * Self-hosted and self-subset, because next/font/google cannot deliver this. Google's css2 API
 * strips the typographic tables: its EB Garamond ships 336 glyphs with no smcp, c2sc or onum,
 * where upstream has over three thousand with all of them. This file is Literata subset with
 * pyftsubset to 439 glyphs and 151 KB, keeping both variable axes (opsz 7–72, wght 200–900) and
 * the features the page actually uses. See scripts/subset-font.sh.
 */
const datumText = localFont({
  src: "../fonts/datum-text.woff2",
  variable: "--font-datum-text",
  display: "swap",
  weight: "200 900",
})

export const metadata: Metadata = {
  title: "Datum — a journal of architecture and the built environment",
  description:
    "Issue 14: Shade. A publication with no photography — every illustration is a live three-dimensional study, lit and shadowed in the browser.",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${datumText.variable} ${sans.variable} ${mono.variable} h-full`}>
      <body className="grain flex min-h-full flex-col">
        {children}
        {/* One grain layer over everything: a flat dark ground reads as a screen, not a room. */}
        <div
          aria-hidden="true"
          className="grain-layer pointer-events-none fixed inset-0 z-50 opacity-[0.045] mix-blend-overlay"
        />
      </body>
    </html>
  )
}
