import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/features/common/components/Header";
import { NexusProvider } from '@avail-project/nexus-widgets';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ShieldFi - Decentralized Insurance for Web3",
  description:
    "Protect your digital assets with transparent, trustless insurance powered by blockchain technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NexusProvider
          config={{
            debug: false,
            network: 'testnet'
          }}
        >
          <Header />
          {children}
        </NexusProvider>
      </body>
    </html>
  );
}
