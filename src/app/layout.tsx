import type { Metadata } from 'next'
import { Providers } from '@/components/providers/providers'
import '@/app/globals.css'

export const metadata: Metadata = {
  title: 'Clacky AI',
  description: 'Clacky AI'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
