import type { Metadata } from "next";
import { Space_Grotesk, Geist, Special_Elite } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const specialElite = Special_Elite({
  subsets: ["latin"],
  variable: "--font-special-elite",
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Confidential Safe Payroll",
  description:
    "A privacy layer on top of Gnosis Safe. Team salaries encrypted end-to-end via iExec Nox, settled on Sepolia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${geist.variable} ${specialElite.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
