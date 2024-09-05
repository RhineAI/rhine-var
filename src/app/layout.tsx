import type { Metadata } from "next";
import { Inter } from "next/font/google";
import {ReactNode} from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Rhine Var Playground",
  description: "The world's most intuitive and reliable strongly-typed collaborative library",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
