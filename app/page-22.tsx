import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-6xl font-bold">
        Welcome to the Language Learning App
      </h1>
      <p className="mt-3 text-2xl">
        Start learning a new language today!
      </p>
      <div className="mt-6">
        <Link href="/learn" className="px-6 py-3 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors">
          Start Learning
        </Link>
      </div>
    </div>
  )
}

