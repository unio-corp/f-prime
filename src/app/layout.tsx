import type { Metadata } from "next";
import "./globals.css";

// TODO: OG image e favicon di Femmina Prime — quelle del sito sorgente non
// vanno pubblicate sotto il nostro dominio.
export const metadata: Metadata = {
  metadataBase: new URL("https://f-prime.vercel.app"),
  title: "Moodboard — Femmina Prime",
  description:
    "La moodboard di Femmina Prime: immagini, video e parole raccolte in una griglia editoriale.",
  openGraph: {
    title: "Moodboard — Femmina Prime",
    description:
      "La moodboard di Femmina Prime: immagini, video e parole raccolte in una griglia editoriale.",
    locale: "it_IT",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className="h-full">
      <head>
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
          href="/moodboard/fonts/sans.woff2"
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
