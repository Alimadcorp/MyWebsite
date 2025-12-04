import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Alimad Co",
  description: "Hi! My name is Muhammad Ali, I'm a game, web and app developer, a CGI artist, and a student. I have been working on stuff like this since 2018. I just find fun and value in helping and solving other people's problems through software. I also find happiness in being able to help my friends.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased p-0 m-0 w-[100vw] overflow-x-hidden`}
        suppressHydrationWarning
      >
        {children}
        <Analytics />
        <SpeedInsights />
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5272041308290617" crossOrigin="anonymous"></script>
      </body>
    </html>
  );
}
