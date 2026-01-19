import { Inter } from 'next/font/google'
import { ReactNode } from 'react'

import type { Metadata } from 'next'
import './layout.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'RHINE VAR Playground',
  description: "The world's most intuitive and reliable strongly-typed collaborative library",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang='zh-cn'>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
