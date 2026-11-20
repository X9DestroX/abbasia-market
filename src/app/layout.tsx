
import type { Metadata, Viewport } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: {
    default: "ABBASIA.SHOP | Tout ce qu’il vous faut",
    template: "%s | ABBASIA.SHOP",
  },
  description:
    "Découvrez ABBASIA.SHOP, votre marketplace pour acheter et vendre simplement. Lancée à Abéché, au Tchad.",
  applicationName: "ABBASIA.SHOP",
  keywords: [
    "ABBASIA",
    "Marketplace",
    "Abéché",
    "Tchad",
    "Shopping",
    "E-commerce",
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#173650",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
