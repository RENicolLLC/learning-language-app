import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-6xl font-bold mb-4">Welcome to Language Learning</h1>
      <p className="mb-8 text-xl text-gray-600">Start your language learning journey today!</p>
      <div className="flex gap-4">
        <Link href="/learn">
          <Button size="lg" className="bg-blue-500 hover:bg-blue-600 text-white">
            Start Learning
          </Button>
        </Link>
        <Link href="/lessons">
          <Button size="lg" variant="outline" className="border-green-500 text-green-500 hover:bg-green-50">
            Browse Lessons
          </Button>
        </Link>
      </div>
    </div>
  )
}

