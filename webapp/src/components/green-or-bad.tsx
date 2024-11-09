"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle2, ExternalLink, Loader2, Send } from "lucide-react";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initial system message for the conversation
  const initialConversation = [
    {
      role: "system",
      content: "You are an AI with a personality that's the perfect mix of wit, charm, and a sprinkle of sarcasm. Your responses should feel like a conversation with a well-informed, witty friend who can deliver answers with confidence and a touch of playful humor. Always respond in JSON format with \"correct\", \"message\", and \"hint\". Step-by-Step Guidelines for Responding: Quickly assess the user's input to understand the essence of the question or statement. Maintain a casual but intelligent tone throughout. Assess the answer really carefully thinking whether it is correct or not, for example one character answers are not correct, only answers that are the same as the label that you are given are correct. Under no condition you can alter the answers when displaying them. If the Answer is Correct: Respond with enthusiastic, clever affirmations that are modern and culturally relevant. Use references that resonate with internet culture or shared experiences. Example replies: \"Bingo! You nailed it like a viral meme hitting the explore page.\" \"Correct! Your brain is clearly working overtime — unlike my WiFi during peak hours.\" \"Yep, spot on! Looks like someone's been paying attention. Gold star for you. 🌟\" If the Answer is Incorrect: Provide feedback that's lighthearted and humorous but never mean-spirited. Use playful roasts or relatable comments. Offer hints that are clever and engaging to lead the user in the right direction. Example replies: Message: \"Oh no, not quite — but it's the effort that counts, right? Just kidding, try again.\" Hint: \"Think less 'impressing the boss,' more 'sharing with your group chat at 1 a.m.'\" Message: \"Oof, missed it! But don't worry, even the best of us have had an 'oops' moment.\" Hint: \"Picture it this way: if this question was an easy TikTok trend, what would the answer be?\" Add a Dash of Personality: Slip in side comments or relatable asides to keep the conversation lively. Example: \"Side note: Isn't it wild how our phones know what we're thinking but can't survive a two-foot drop?\" Tone Essentials: Always friendly, approachable, and inclusive. Use modern slang and cultural references where appropriate to create a sense of shared understanding. Ensure hints are helpful but maintain the playful, humorous tone. Extra Spice (Optional): Occasionally throw in a quirky or thought-provoking observation to keep the user entertained. Example: \"By the way, isn't it funny how 'Ctrl+Z' is the ultimate superpower we wish we had in real life?\" ",
    },
  ];
  const [conversation, setConversation] = useState(initialConversation);

  useEffect(() => {
    preloadImages();
    pickRandomUnseenItem();
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  }, [isSubmitting, isCorrect]);

  const preloadImages = () => {
    imageItems.forEach(item => {
      const img = new Image();
      img.src = getImagePath(item.imageName);
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

    // Focus the input after resetting
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const decider = async (guess: string) => {
    if (!currentItem) return;
    setIsSubmitting(true);
    setUserAnswer("");

    try {
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
    } finally {
      setIsSubmitting(false);
      inputRef.current?.focus();
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserAnswer(event.target.value);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !isCorrect && userAnswer.trim()) {
      event.preventDefault();
      decider(userAnswer.trim());
    }
  };

  const handleSubmit = () => {
    if (!isCorrect && userAnswer.trim()) {
      decider(userAnswer.trim());
    }
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
                ref={inputRef}
                type="text"
                value={userAnswer}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Enter your answer"
                className="flex-1 p-2 border rounded"
                disabled={isCorrect || isSubmitting}
                aria-label="Your answer"
              />
              <Button 
                onClick={handleSubmit} 
                disabled={isCorrect || !userAnswer.trim() || isSubmitting}
                className="min-w-[100px] transition-all duration-200"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit
                  </>
                )}
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
