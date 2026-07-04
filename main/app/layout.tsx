import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { excaliFont } from './fonts';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Muhammad Ali",
  description: "Assalamualaikum, I am a muslim, based in Lahore, Pakistan. I often write program a lot!",
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
        className={`${geistSans.variable} ${geistMono.variable} ${excaliFont.className} ${excaliFont.variable} antialiased p-0 m-0 w-[100vw] overflow-x-hidden`}
        suppressHydrationWarning
      >
        <AppRouterCacheProvider>
          {children}
          <Analytics />
          <SpeedInsights />
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
