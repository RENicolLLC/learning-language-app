import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold">
          Welcome to the Language Learning App
        </h1>
        <p className="mt-3 text-2xl">
          Start learning a new language today!
        </p>
        <div className="flex mt-6">
          <Link href="/learn" className="mx-4 px-6 py-3 rounded-md bg-blue-600 text-white">
            Start Learning
          </Link>
          <Link href="/api/auth/signin" className="mx-4 px-6 py-3 rounded-md bg-gray-200 text-gray-700">
            Sign In
          </Link>
        </div>
      </main>
    </div>
  )
}

