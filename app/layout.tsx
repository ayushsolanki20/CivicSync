import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/context";

export const metadata: Metadata = {
  title: "Civic Sync | AI-powered Civic Action Portal",
  description: "Report, verify, track and solve civic issues with the help of AI and your community.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50 text-slate-900 min-h-screen" suppressHydrationWarning>
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
