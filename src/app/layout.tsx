import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-sans" 
});

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"], 
  variable: "--font-mono" 
});

export const metadata: Metadata = {
  title: "AI Enterprise Hub | Organization AI & RAG Platform",
  description: "Manage organizational knowledge bases, secure multi-model AI agents, run automated workflows, chat with enterprise documents, and manage role-based user access.",
  keywords: ["AI Enterprise Hub", "RAG", "AI Agents", "Workflow Automation", "Enterprise AI", "Knowledge Management"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable, jetbrainsMono.variable)} suppressHydrationWarning>
      <body className="font-sans antialiased text-foreground bg-background">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
