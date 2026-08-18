import type { Metadata } from "next";
import { Lora, Inter, Oswald } from "next/font/google";
import MotionProvider from "@/components/MotionProvider";
import "./globals.css";

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Ayush Kumar — Full-Stack Developer & ML Engineer",
  description:
    "Portfolio of Ayush Kumar — building intelligent systems where deep learning, full-stack development, and clean engineering meet.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${lora.variable} ${inter.variable} ${oswald.variable} antialiased`}>
        {/* Global filter defs — currently powers the roughed-up edge on the
            footer's "Case Closed" rubber-stamp (`[filter:url(#fm-rough)]`).
            Zero-size and hidden from the a11y tree; SVG filters must live
            in the DOM to be referenced by url(), so it's mounted once here
            rather than per-component. */}
        <svg width="0" height="0" className="absolute" aria-hidden="true">
          <defs>
            <filter id="fm-rough">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.9"
                numOctaves="2"
                seed="4"
                result="noise"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale="2.5"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>
        </svg>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
