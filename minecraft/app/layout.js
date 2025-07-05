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

// app/layout.tsx or app/page.tsx
export const metadata = {
  title: 'MineMad',
  description: 'Alimad Minecraft Server',
  openGraph: {
    title: 'MineMad',
    description: 'Alimad Minecraft Server',
    images: [
      {
        url: 'https://upload.wikimedia.org/wikipedia/en/b/b6/Minecraft_2024_cover_art.png',
        width: 1200,
        height: 630,
        alt: 'Minecraft 2024 Cover Art',
      },
    ],
  },
  icons: {
    icon: 'https://upload.wikimedia.org/wikipedia/en/b/b6/Minecraft_2024_cover_art.png',
    shortcut: 'https://upload.wikimedia.org/wikipedia/en/b/b6/Minecraft_2024_cover_art.png',
    apple: 'https://upload.wikimedia.org/wikipedia/en/b/b6/Minecraft_2024_cover_art.png',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MineMad',
    description: 'Alimad Minecraft Server',
    images: ['https://upload.wikimedia.org/wikipedia/en/b/b6/Minecraft_2024_cover_art.png'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
