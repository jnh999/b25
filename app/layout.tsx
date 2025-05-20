// app/layout.tsx
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "./Header";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "SparkX",
  description:
    "A global, open peer-to-peer payments platform for Bitcoin and Stablecoins.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <div className="bg-white text-black min-h-screen flex flex-col font-sans">
              <Header />
              <main className="flex-1">{children}</main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
