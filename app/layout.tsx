import { Geist_Mono } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { APP_NAME } from "@/config";
import { cn } from "@/lib/utils";

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: `${APP_NAME} — Merchant Portal`,
  description: "Manage payments, transactions, invoices, and your team.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("theme")||"system",d=t==="dark"||(t==="system"&&window.matchMedia("(prefers-color-scheme:dark)").matches);if(d)document.documentElement.classList.add("dark")}catch(e){}`,
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className={cn(
          "min-h-svh bg-background font-sans antialiased",
          fontMono.variable
        )}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
