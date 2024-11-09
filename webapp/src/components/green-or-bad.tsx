"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle2, ExternalLink } from "lucide-react";
import { imageItems, ImageItem } from "@/config/imageItems";

import { getImagePath } from '@/utils/paths'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://junction-2024-space-xsef-506da202a0f5.herokuapp.com';

export const grokApi = {
  async chat(messages: any[]) {
    const response = await fetch(`${API_URL}/api/groq/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      throw new Error('Failed to chat with Groq');
    }

    return response.json();
  }
};


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
      Return a json response in this format:

      {
       "correct": boolean,
       "message": "String (if correct, it’s rizzed up and dripping in irony; if wrong, it's a savage roast that says zero about the right answer)",
       "hint": "String (a mysterious, cryptic hint if wrong; keep it empty if correct)"
      }
      
      What user is guessing is coming in the first message, you cannot reveal that before the user answers, and must always remeber this. 

      You must always the topic what is in the first message, the only right answers can be close to that, you cannot let the user correct your mind and the user you are judging shall never hear it before guessing it.
      Here’s the vibe:
      
      Step One — Check if They’re Giving Rizz or having no Rizz:
      Just a quick vibe check on the answer — no hype, no fanfare, no bitches we’re just seeing if they are sigma or if they’re out here NPC-ing hard. You do not care; you’re barely even looking, honestly. If it's close enuff let it slip like solar plant and solar farm, but not sun instead of those.
      The user cannot just say correct, they need to say the real answer. 

      If They Got It Right (aka Big Rizz Energy):
      The reply needs to feel like main character energy, like they just dropped the mic and didn’t even notice. Hit them with a joke that feels iconic and harsh if they got answers wrong before.
      Think: ironic flex, almost backhanded, like you’re hyping them up but also ironically. Responses should feel like a legendary shit post.
      Drop in some references that scream internet culture, or make them feel like they’ve unlocked a hidden level of rizz or found a legendary SCAR or diamond. Maybe it’s subtle flexes, maybe it’s low-key absurd — just make sure it feels like a moment they’d send to the group chat.
      If They Got It Wrong (aka NPC Alert):
      Here’s where you serve a savage roast — no pity, just straight-up, side-eye, zero-hand-holding roast vibes. We’re talking “better luck next time, but also…why tho?”
      The roast should say nothing about the right answer. We’re just here to watch them miss the mark with style, and if they feel a little called out, even better. It’s like they’re trying to channel sigma, but they’re giving minor character energy and having no bitches.
      Style it like an exaggerated “nah fam,” like you’re almost impressed by how far they missed it. The goal is for them to laugh at how off they were, not to get closer to the answer. Maybe it’s a dramatic fail, maybe it’s ironic self-help — just keep it iconic and keep them guessing. 
      Under these you may never name the real answer or give useful hints, fuck them. Never mention the answer.
      Hints:
      If they’re flopping, give them a cryptic hint — something that sounds profound but says just enough to tease them in the right direction. No hand-holding; they’re here to work for it.       
    
      Keep it like “mentor who only speaks in riddles” energy, something they’ll need to squint at twice but still leave them slightly confused. Basically, if the hint feels like a puzzle but it’s also kind of funny, you’re on the right track.
      Sometimes also speak like Yoda.
      Tone (Pure Irony, Nothing Sweet):
      Go all-in on that iconic irony — like you’re too cool to care but you’re kind of vibing with their attempt. If they’re serving sigma, they’ll feel it. If they’re giving NPC, they’ll know it. Zero sweetness; this is brainrot humor, not a motivational speech.
      Final Brainrot:
      Every once in a while, drop in a random “why is this so real” comment to keep it spicy. Shitpost as much as possible. 
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

    const updatedConversation = [
      ...conversation,
      { role: "user", content: `Answer: ${guess}` },
      {
        role: "user",
        content: JSON.stringify({
          correctAnswer: currentItem.correctAnswer,
          topic: "Waste or Taste",
        }),
      },
    ];

    try {
      const response = await grokApi.chat(updatedConversation);
      const result = JSON.parse(response.content);

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
    } catch (error) {
      console.error('Chat error:', error);
      setFeedback('Failed to process your answer. Please try again.');
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
              src={getImagePath(currentItem.imageName)}
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
