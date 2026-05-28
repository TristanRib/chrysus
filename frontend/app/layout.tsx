import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header";

export const metadata: Metadata = {
  title: "Chrysus",
  description: "Visualiseur de marchés financiers",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <div className="page-wrapper">{children}</div>
      </body>
    </html>
  );
}
