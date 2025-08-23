import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import ServiceWorkerProvider from "./components/ServiceWorkerProvider"; // ✅ import natin

const inter = Inter({
  weight: "100",
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Ecoshift Corporation",
  description: "Created in NextJs Developed By Leroux Y Xchire",
  icons: {
    icon: "/ecoico.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0891b2" />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <ToastContainer />
        {children}
        <Analytics />
        <SpeedInsights />
        <ServiceWorkerProvider /> {/* ✅ dito na natin ininject */}
      </body>
    </html>
  );
}
