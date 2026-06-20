import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FasilitasLapor",
  description: "Platform pelaporan kerusakan fasilitas umum dengan crowdsourcing validation dan priority scoring"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
