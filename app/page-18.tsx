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
        <p className="mt-3 text-xl">
          Our app features a comprehensive English Learning Plan for Vietnamese students, 
          following an American-style progression from 1st to 12th grade.
        </p>
        <div className="flex mt-6">
          <Link href="/learn" className="mx-4 px-6 py-3 rounded-md bg-blue-600 text-white">
            Start Learning
          </Link>
        </div>
      </main>
    </div>
  )
}

