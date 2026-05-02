import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://groupchatwrapped.vercel.app"),
  title: "Group Chat Wrapped",
  description:
    "Drop your WhatsApp chat. See your group's wrapped. Your chat never leaves your browser.",
  openGraph: {
    title: "Group Chat Wrapped",
    description:
      "Drop your WhatsApp chat. See your group's wrapped. Your chat never leaves your browser.",
    type: "website",
    siteName: "Group Chat Wrapped",
  },
  twitter: {
    card: "summary_large_image",
    title: "Group Chat Wrapped",
    description: "Drop your WhatsApp chat. See your group's wrapped.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-[100dvh] flex flex-col bg-black text-white">
        {children}
      </body>
    </html>
  );
}
