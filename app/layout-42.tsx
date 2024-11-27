import './globals.css'
import { Inter } from 'next/font/google'
import Link from 'next/link'

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
        <header className="bg-blue-500 p-4 text-white">
          <nav className="container mx-auto flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold">
              Language Learning
            </Link>
            <ul className="flex space-x-4">
              <li>
                <Link href="/" className="hover:underline">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/learn" className="hover:underline">
                  Learn
                </Link>
              </li>
              <li>
                <Link href="/lessons" className="hover:underline">
                  Lessons
                </Link>
              </li>
            </ul>
          </nav>
        </header>
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="bg-gray-200 p-4 text-center">
          <p>&copy; 2023 Language Learning App. All rights reserved.</p>
        </footer>
      </body>
    </html>
  )
}

