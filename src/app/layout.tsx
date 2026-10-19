import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import "./globals.css"

const sans = Geist({ variable: "--font-geist-sans", subsets: ["latin"], display: "swap" })
const mono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap" })

export const metadata: Metadata = {
  title: "Datum — a journal of architecture and the built environment",
  description:
    "Issue 14: Shade. A publication with no photography — every illustration is a live three-dimensional study, lit and shadowed in the browser.",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable} h-full`}>
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
