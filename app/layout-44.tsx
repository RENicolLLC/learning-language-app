import './globals.css'
import { Inter } from 'next/font/google'
import { Navigation } from '../components/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Language Learning App',
  description: 'Learn languages with our interactive app',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="bg-gray-100 p-4 text-center mt-8">
          <p className="text-gray-600">&copy; 2023 Language Learning App. All rights reserved.</p>
        </footer>
      </body>
    </html>
  )
}

