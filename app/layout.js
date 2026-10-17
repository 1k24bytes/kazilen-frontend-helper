import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ServiceWorkerRegister from "./components/ServiceWorkerRegister";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Kazilen Worker",
  description: "Worker dashboard for Kazilen",
  manifest: "/manifest.json",
  icons: { apple: "/icons/icon-192x192.png" },
  appleWebApp: { capable: true, title: "Kazilen Partner", statusBarStyle: "default" },
};

export const viewport = {
  themeColor: "#ff8a4c",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
