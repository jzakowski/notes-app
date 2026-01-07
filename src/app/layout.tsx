import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '@/components/ThemeProvider'
import { SessionProvider } from '@/components/SessionProvider'
import { UploadThingProvider } from '@/lib/uploadthing'

export const metadata: Metadata = {
  title: 'Notes App',
  description: 'A simple and elegant note-taking app',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        <SessionProvider>
          <UploadThingProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              {children}
              <Toaster position="top-right" />
            </ThemeProvider>
          </UploadThingProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
