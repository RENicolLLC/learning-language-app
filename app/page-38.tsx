import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-4">Welcome to Language Learning</h1>
      <p className="mb-8 text-xl text-gray-600">Start your language learning journey today!</p>
      <div className="flex gap-4">
        <Link 
          href="/learn" 
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Start Learning
        </Link>
        <Link 
          href="/lessons" 
          className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          Browse Lessons
        </Link>
      </div>
    </div>
  )
}

