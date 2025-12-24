import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/shared/Navbar";
import ConditionalFooter from "@/components/shared/ConditionalFooter";
import AuthInitializer from "@/components/auth/AuthInitializer";

export const metadata = {
  title: "NeoHire AI",
  description: "The brutal hiring platform.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
          <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased flex flex-col min-h-screen">
        <AuthInitializer />
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <ConditionalFooter />
      </body>
    </html>
  );
}
