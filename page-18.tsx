import Link from 'next/link'

export default function About() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">About Language Learning App</h1>
      <p className="mb-4">We are dedicated to helping people learn new languages efficiently and effectively using AI-powered tools.</p>
      <Link href="/" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Back to Home
      </Link>
    </div>
  )
}

