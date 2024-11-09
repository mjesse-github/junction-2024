"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, CheckCircle2, ExternalLink, Sparkles } from "lucide-react"

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
    <div className="min-h-screen bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg mx-auto border-2 border-white/20 backdrop-blur-sm bg-black/50">
        <CardHeader>
          <CardTitle className="text-3xl sm:text-4xl text-center font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
            <span className="flex items-center justify-center gap-2">
              <Sparkles className="h-8 w-8 text-yellow-400" />
              Green or Bad
              <Sparkles className="h-8 w-8 text-yellow-400" />
            </span>
          </CardTitle>
          <CardDescription className="text-center text-lg font-bold text-white/90">
            {currentPair.title}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              variant="outline"
              className="p-0 h-auto w-full sm:w-1/2 aspect-[3/4] overflow-hidden relative rounded-xl border-2 border-white/20 hover:scale-[1.02] transition-all duration-300"
              onClick={() => handleGuess("image1")}
              disabled={revealAnswer}
            >
              <img
                src={currentPair.image1}
                alt="First image in the pair"
                className="w-full h-full object-cover"
              />
              {revealAnswer && (
                <div className="absolute inset-x-0 bottom-0 bg-black/80 text-white p-3 text-center font-bold">
                  {currentPair.description1}
                </div>
              )}
            </Button>
            <Button
              variant="outline"
              className="p-0 h-auto w-full sm:w-1/2 aspect-[3/4] overflow-hidden relative rounded-xl border-2 border-white/20 hover:scale-[1.02] transition-all duration-300"
              onClick={() => handleGuess("image2")}
              disabled={revealAnswer}
            >
              <img
                src={currentPair.image2}
                alt="Second image in the pair"
                className="w-full h-full object-cover"
              />
              {revealAnswer && (
                <div className="absolute inset-x-0 bottom-0 bg-black/80 text-white p-3 text-center font-bold">
                  {currentPair.description2}
                </div>
              )}
            </Button>
          </div>
          {revealAnswer && (
            <p className="text-center mt-4 text-xl font-bold text-white">{currentPair.location}</p>
          )}
          {feedback && (
            <div
              className={`mt-4 p-4 rounded-xl border-2 flex items-center gap-2 animate-bounce-once ${
                isCorrect 
                  ? "bg-green-400/20 border-green-400 text-green-400" 
                  : "bg-red-400/20 border-red-400 text-red-400"
              }`}
              role="alert"
            >
              {isCorrect ? <CheckCircle2 className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
              <span className="font-bold">{feedback}</span>
            </div>
          )}
          {showCharity && (
            <div className="mt-4 p-4 bg-blue-400/20 border-2 border-blue-400 text-blue-400 rounded-xl animate-fade-in-up">
              <p className="font-bold mb-2">Level up your environmental knowledge! 🌍</p>
              <a
                href={currentPair.charity.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
              >
                Visit {currentPair.charity.name} <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col items-center">
          <div className="w-full max-w-xs mb-2">
            <Progress 
              value={(score / totalQuestions) * 100} 
              className="h-3 rounded-full bg-white/10" 
            />
          </div>
          <p className="text-lg font-bold text-white/90">
            Score: {score} / {totalQuestions}
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
