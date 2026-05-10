import type { Metadata } from 'next'
import { Hanken_Grotesk, Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

export const metadata: Metadata = {
  title: 'Tokenwise AI Spend Audit',
  description: 'Forensic AI spend audit',
}

const inter = Inter({ subsets: ['latin'], variable: '--font-body' })
const hanken = Hanken_Grotesk({ subsets: ['latin'], variable: '--font-heading' })
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body className={`${inter.variable} ${hanken.variable} ${mono.variable}`}>{children}</body>
    </html>
  )
}
