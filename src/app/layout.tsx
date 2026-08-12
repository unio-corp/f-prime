import type { Metadata } from "next";
import "./globals.css";

const OG_IMAGE =
  "/sites/www-magdabutrym-com-f039a414/it-en-moodboard-official-834833dd/seo/og-image.jpg";

export const metadata: Metadata = {
  metadataBase: new URL("https://magdabutrym.com"),
  title: "Official Store",
  description:
    "Official luxury clothing designer ready-to-wear brand store Magda Butrym. Online Fashion Store. Luxury Designer Clothes. Luxury Fashion. Official Fashion Store.",
  icons: {
    icon: "/sites/www-magdabutrym-com-f039a414/it-en-moodboard-official-834833dd/seo/favicon.ico",
  },
  openGraph: {
    title: "Official Store",
    description:
      "Official luxury clothing designer ready-to-wear brand store Magda Butrym. Online Fashion Store. Luxury Designer Clothes. Luxury Fashion. Official Fashion Store.",
    locale: "en_IE",
    images: [{ url: OG_IMAGE, width: 1200, height: 630 }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
          href="/sites/www-magdabutrym-com-f039a414/it-en-moodboard-official-834833dd/fonts/sans.woff2"
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
