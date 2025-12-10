import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import LiveStatus from "@/components/live";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Alimad Blog",
  description: "A personal blog by Ali",
  icons: {
    icon: `https://blog.alimad.co/api/og/${encodeURIComponent("Alimad Blog")}`,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`min-h-screen ${geistSans.variable} ${geistMono.variable} antialiased bg-black`}
      >
        <div className="max-w-3xl mx-auto px-4">
          <main className="py-6">{children}</main>
          <Footer />
        </div>
        <Analytics />
      </body>
    </html>
  );
}

function Footer() {
  return (
    <footer className="py-6 mx-5 text-sm text-gray-500">
      <a href="/" className="font-sans hover:underline">© Alimad Blogs</a>
    </footer>
  );
}
