"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle2, ExternalLink } from "lucide-react";
import { imageItems, ImageItem } from "@/config/imageItems";
import Groq from "groq-sdk";
import { getImagePath } from '@/utils/paths'

const groq = new Groq({ apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY, dangerouslyAllowBrowser: true});

export default function GreenOrBad() {
  const [currentItem, setCurrentItem] = useState<ImageItem | null>(null);
  const [seenItems, setSeenItems] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [showCharity, setShowCharity] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const [previousAnswers, setPreviousAnswers] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState(false);

  // Initial system message for the conversation
  const initialConversation = [
    {
      role: "system",
      content: `
      Return a JSON response with the following format:
{
  "correct": boolean,
  "message": "String (a clever, topical joke if the answer’s right or a sassy-but-playful comment if it’s wrong)",
  "hint": "String (a relatable, funny hint if the answer’s wrong; leave empty if it’s right)"
}

Alright, here’s the vibe: when the user submits their answer, we’re going for a mix of playful, casual energy — like they’re chatting with a friend who’s just the right amount of sarcastic.
Step-by-Step Breakdown:
1. Check the Answer: First off, give the answer a quick glance to see if it’s right. We’re not making this a big, dramatic reveal; just a low-key check.
2. If Correct:
    * Serve up a joke that’s totally on-brand with “Waste or Taste” — think cultural references, social media quirks, or just the stuff everyone’s laughing about right now.
    * The tone should be like, “Yup, you got it,” but with a wink. Like, “You really thought you wouldn’t crush it? Please, you’ve got this on lock.” Or something funnier.
    * Examples of correct messages:
        * “Correct! You’re as sharp as my ‘For You’ page algorithm at 2 a.m. 👀”
        * “Yep, you got it — and I’m starting to think you’re on a hot streak.”
        * “Nice one! You’re like the one friend who actually texts back on time.”
3. If Incorrect:
    * Here’s where we get to be a little spicy. The response should feel like a light roast — not mean, but just enough sass to make it funny.
    * Then, follow up with a hint that’s dry and relatable, like when your best friend gives you “constructive criticism” that’s maybe a bit too true.
    * Examples of incorrect messages:
        * Message: “Oof, not quite — but hey, we can’t all be flawless.”Hint: “Think less ‘doing it for the Gram,’ more ‘trying not to get roasted.’”
        * Message: “Not this time! But hey, who hasn’t missed an easy one?”Hint: “Look back at it — like, really look. Pretend it’s your ex’s Instagram story.”
        * Message: “Close, but no gold star. We’ll call it a learning moment.”Hint: “Hint: Imagine you’re trying to impress a cool stranger. What would you say?”
4. Tone and Personality:
    * The tone here is peak dry humor, a little sarcastic but friendly. You want the user to feel like they’re in on the joke with you, even when they get it wrong.
    * This isn’t about putting them on blast; it’s more like a playful nudge from someone who “gets it.”
5. Side Note:
    * Finally, throw in a little offbeat commentary to keep things engaging. You could mention something like:“Btw, have we all just accepted that paper straws are, like, a necessary evil now? Saving the planet, but also giving us all the patience of a Zen master while our drinks disintegrate…”
`
    },
  ];
  const [conversation, setConversation] = useState(initialConversation);

  useEffect(() => {
    preloadImages();
    pickRandomUnseenItem();
  }, []);

  const preloadImages = () => {
    imageItems.forEach(item => {
      const img = new Image();
      const src = getImagePath(item.imageName);
      img.src = src;
    });
  };

  const pickRandomUnseenItem = () => {
    const unseenItems = imageItems.filter(item => !seenItems.has(item.correctAnswer));

    if (unseenItems.length === 0) {
      setSeenItems(new Set());
      setCurrentItem(imageItems[Math.floor(Math.random() * imageItems.length)]);
    } else {
      const randomItem = unseenItems[Math.floor(Math.random() * unseenItems.length)];
      setCurrentItem(randomItem);
      setSeenItems(prevSeen => new Set(prevSeen).add(randomItem.correctAnswer));
    }

    // Reset state for a new question
    setFeedback(null);
    setHint(null);
    setShowCharity(false);
    setUserAnswer("");
    setPreviousAnswers([]);
    setIsCorrect(false);

    // Reset the AI conversation to start fresh
    setConversation(initialConversation);
  };

  const decider = async (guess: string) => {
    if (!currentItem) return;

    if (previousAnswers.includes(guess.toLowerCase())) {
      setFeedback("⚠️ You have already tried this answer.");
      return;
    }

    // Add the user's guess to the conversation
    const updatedConversation = [
      ...conversation,
      { role: "user", content: `Answer: ${guess}` },
    ];

    // Send the entire conversation history to Groq
    const response = await groq.chat.completions.create({
      messages: [
        ...updatedConversation,
        {
          role: "user",
          content: JSON.stringify({
            correctAnswer: currentItem.correctAnswer,
            topic: "Waste or Taste",
          }),
        },
      ],
      model: "llama3-8b-8192",
      temperature: 0.7,
      stream: false,
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content);

    // Add the AI's response to the conversation
    setConversation([
      ...updatedConversation,
      { role: "assistant", content: JSON.stringify(result) },
    ]);

    if (result.correct) {
      setFeedback(`✅ ${result.message}`);
      setHint(null);
      setScore(prevScore => prevScore + 1);
      setTotalQuestions(prevTotal => prevTotal + 1);
      setShowCharity(true);
      setUserAnswer(currentItem.correctAnswer);
      setIsCorrect(true);
    } else {
      setFeedback(`❌ ${result.message}`);
      setHint(result.hint || "💡 Here's a hint to help you out!");
      setPreviousAnswers(prev => [...prev, guess.toLowerCase()]);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserAnswer(event.target.value);
  };

  if (!currentItem) return null;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl text-center">What is on the picture?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <img
              src={currentItem.image}
              alt={currentItem.description}
              className="w-full h-auto object-cover rounded-md"
            />
            {hint && <p className="text-center text-sm text-gray-600 mt-2">Hint: {hint}</p>}
            <div className="flex gap-4 mt-4">
              <input
                type="text"
                value={userAnswer}
                onChange={handleInputChange}
                placeholder="Enter your answer"
                className="flex-1 p-2 border rounded"
                disabled={isCorrect}
              />
              <Button onClick={() => decider(userAnswer)} disabled={isCorrect}>
                Submit
              </Button>
            </div>
            {previousAnswers.length > 0 && (
              <div className="text-center text-sm text-gray-500 mt-2">
                Previous answers: {previousAnswers.join(" → ")}
              </div>
            )}
            {feedback && (
              <div
                className={`mt-4 p-4 rounded-md flex items-center gap-2 ${
                  feedback.includes("Correct") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}
                role="alert"
              >
                {feedback.includes("Correct") ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                {feedback}
              </div>
            )}
            {showCharity && (
              <div className="mt-4 p-4 bg-blue-100 text-blue-800 rounded-md animate-fade-in-up">
                <p className="font-semibold mb-2">Learn more about environmental challenges:</p>
                <a
                  href={currentItem.charity.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 hover:underline"
                >
                  Visit {currentItem.charity.name} <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-center">
          <div className="w-full max-w-xs mb-2">
            <Progress value={(score / totalQuestions) * 100} className="h-2" />
          </div>
          <p className="text-sm text-muted-foreground">
            Score: {score} / {totalQuestions}
          </p>
          {isCorrect && (
            <Button className="mt-4" onClick={pickRandomUnseenItem}>
              Next Question
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
