import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import RouteTransition from "@/components/RouteTransition";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Trako - Project Management Dashboard",
  description: "A comprehensive project management and developer allocation system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <RouteTransition>
            {children}
          </RouteTransition>
        </div>
      </body>
    </html>
  );
}