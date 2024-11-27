'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
]

const levels = [
  { name: "Beginner", topics: ["Greetings", "Numbers", "Colors"] },
  { name: "Intermediate", topics: ["Past Tense", "Future Tense", "Conditional"] },
  { name: "Advanced", topics: ["Idioms", "Literature", "Business Language"] },
]

export default function Home() {
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0].code)
  const [textToTranslate, setTextToTranslate] = useState('')
  const [translatedText, setTranslatedText] = useState('')

  const handleTranslate = async () => {
    // In a real app, this would call an API for translation
    setTranslatedText(`Translated: ${textToTranslate}`)
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Language Learning App</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Select Language</CardTitle>
        </CardHeader>
        <CardContent>
          <Select onValueChange={setSelectedLanguage} defaultValue={selectedLanguage}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Learning Plan</CardTitle>
        </CardHeader>
        <CardContent>
          {levels.map((level, index) => (
            <div key={index} className="mb-4">
              <h3 className="text-xl font-semibold mb-2">{level.name}</h3>
              <ul className="list-disc list-inside">
                {level.topics.map((topic, topicIndex) => (
                  <li key={topicIndex}>{topic}</li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Translation Tool</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2 mb-4">
            <Input
              type="text"
              placeholder="Enter text to translate"
              value={textToTranslate}
              onChange={(e) => setTextToTranslate(e.target.value)}
            />
            <Button onClick={handleTranslate}>Translate</Button>
          </div>
          {translatedText && (
            <div className="p-4 bg-gray-100 rounded">
              <p>{translatedText}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

