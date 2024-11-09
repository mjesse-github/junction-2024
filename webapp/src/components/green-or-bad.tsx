"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, CheckCircle2, ExternalLink } from "lucide-react"

type ImagePair = {
  image1: string
  image2: string
  correctAnswer: "image1" | "image2"
  description1: string
  description2: string
  location: string
  charity: {
    name: string
    url: string
  }
  title: string
}

const imagePairs: ImagePair[] = [
  {
    image1: "/landfill.png",
    image2: "/burning-man.png",
    correctAnswer: "image1",
    description1: "Landfill",
    description2: "Burning man",
    location: "Nevada Desert, USA",
    charity: {
      name: "Clean Up The World",
      url: "https://www.cleanuptheworld.org/"
    },
    title: "Pick the landfill"
  },
  {
    image1: "/placeholder.svg?height=400&width=300",
    image2: "/placeholder.svg?height=400&width=300",
    correctAnswer: "image1",
    description1: "Solar Farm",
    description2: "Computer Circuit Board",
    location: "Mojave Desert, California",
    charity: {
      name: "Solar Aid",
      url: "https://solar-aid.org/"
    },
    title: "Pick the solar farm"
  },
  // {
  //   image1: "/placeholder.svg?height=400&width=300",
  //   image2: "/placeholder.svg?height=400&width=300",
  //   correctAnswer: "image2",
  //   description1: "Rice Farm",
  //   description2: "Lithium Mine",
  //   location: "Salar de Uyuni, Bolivia",
  //   charity: {
  //     name: "Environmental Defense Fund",
  //     url: "https://www.edf.org/"
  //   },
  //   title: "Pick the lithium mine"
  // }
]

export default function GreenOrBad() {
  const [currentPair, setCurrentPair] = useState<ImagePair | null>(null)
  const [score, setScore] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [showCharity, setShowCharity] = useState(false)
  const [revealAnswer, setRevealAnswer] = useState(false)

  useEffect(() => {
    console.log('Current pair:', currentPair);
    nextQuestion();
  }, [])

  const nextQuestion = () => {
    const randomPair = imagePairs[Math.floor(Math.random() * imagePairs.length)]
    setCurrentPair(randomPair)
    setFeedback(null)
    setIsCorrect(null)
    setShowCharity(false)
    setRevealAnswer(false)
  }

  const handleGuess = (guess: "image1" | "image2") => {
    if (!currentPair) return

    const isCorrectGuess = guess === currentPair.correctAnswer
    const selectedDescription = guess === "image1" ? currentPair.description1 : currentPair.description2

    setScore(prevScore => isCorrectGuess ? prevScore + 1 : prevScore)
    setTotalQuestions(prevTotal => prevTotal + 1)
    setIsCorrect(isCorrectGuess)
    setFeedback(
      isCorrectGuess
        ? "Correct! You identified the images accurately."
        : `Incorrect. You selected ${selectedDescription}, but that wasn't right.`
    )
    setRevealAnswer(true)
    setShowCharity(true)

    setTimeout(() => {
      setShowCharity(false)
      setTimeout(nextQuestion, 500) // Delay to allow charity popup to fade out
    }, 5000)
  }

  if (!currentPair) return null

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl text-center">Green or Bad</CardTitle>
          <CardDescription className="text-center text-lg font-medium">
            {currentPair.title}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              variant="outline"
              className="p-0 h-auto w-full sm:w-1/2 aspect-[3/4] overflow-hidden relative"
              onClick={() => handleGuess("image1")}
              disabled={revealAnswer}
            >
              <img
                src={currentPair.image1}
                alt="First image in the pair"
                className={`w-full h-full object-cover transition-all duration-300`}
              />
              {revealAnswer && (
                <div className="absolute inset-x-0 bottom-0 bg-black bg-opacity-70 text-white p-2 text-center">
                  {currentPair.description1}
                </div>
              )}
            </Button>
            <Button
              variant="outline"
              className="p-0 h-auto w-full sm:w-1/2 aspect-[3/4] overflow-hidden relative"
              onClick={() => handleGuess("image2")}
              disabled={revealAnswer}
            >
              <img
                src={currentPair.image2}
                alt="Second image in the pair"
                className={`w-full h-full object-cover transition-all duration-300`}
              />
              {revealAnswer && (
                <div className="absolute inset-x-0 bottom-0 bg-black bg-opacity-70 text-white p-2 text-center">
                  {currentPair.description2}
                </div>
              )}
            </Button>
          </div>
          {revealAnswer && (
            <p className="text-center mt-4 text-lg font-semibold">{currentPair.location}</p>
          )}
          {feedback && (
            <div
              className={`mt-4 p-4 rounded-md flex items-center gap-2 ${
                isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}
              role="alert"
            >
              {isCorrect ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
              {feedback}
            </div>
          )}
          {showCharity && (
            <div className="mt-4 p-4 bg-blue-100 text-blue-800 rounded-md animate-fade-in-up">
              <p className="font-semibold mb-2">Learn more about environmental challenges:</p>
              <a
                href={currentPair.charity.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:underline"
              >
                Visit {currentPair.charity.name} <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col items-center">
          <div className="w-full max-w-xs mb-2">
            <Progress value={(score / totalQuestions) * 100} className="h-2" />
          </div>
          <p className="text-sm text-muted-foreground">
            Score: {score} / {totalQuestions}
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
