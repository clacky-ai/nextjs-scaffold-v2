import type { Metadata } from 'next'
import { Providers } from '@/components/providers/providers'
import '@/app/globals.css'

export const metadata: Metadata = {
  title: '投票系统',
  description: '实名投票系统'
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
