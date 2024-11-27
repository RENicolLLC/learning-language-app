import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-4">Welcome to the Language Learning App</h1>
      <p className="mb-4 text-xl">Start your journey to learn a new language today!</p>
      <Link href="/learn" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Start Learning
      </Link>
    </div>
  )
}

