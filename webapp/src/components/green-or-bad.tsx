"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle2, ExternalLink, Loader2, Send } from "lucide-react";
import { imageItems, ImageItem } from "@/config/imageItems";
import { motion, AnimatePresence } from "framer-motion";
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
  const [difficulty, setDifficulty] = useState<string | null>(null); // Track difficulty
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
  const [isImageEnlarged, setIsImageEnlarged] = useState(false);

  const initialConversations = {
    easy: [
      {
        role: "system",
        content:` Return a JSON response in this format:

        {
         "correct": boolean,
         "message": "String (if correct, it’s like a millennial inside joke with a mild flex; if wrong, it’s a sarcastic roast that feels like you’ve stepped back into a mid-2000s meme)",
         "hint": "String (a playful but slightly guiding hint if wrong; keep it empty if correct)"
        }
        
        When the user starts guessing, lock in the topic without any reveals. We’re keeping it a mystery, so don’t let them steer you off-course.
        Here’s the vibe:
        Step One — Are They a Blockbuster Champ or Just Clueless? We’re doing a quick “vibe check” on the answer, no need for confetti here. If they’re kinda close, give them a pass like it’s Blockbuster and their late fee’s getting waived. If they’re totally off, go classic millennial sarcastic—like that friend who loves making snarky comments during a rom-com. And remember, if they’re not even close, keep the answer hidden like you’d keep a Myspace password.
        They have to say the exact answer; no shortcuts like “is it right?” Nope, guess the actual thing or try again.
        If They Got It Right (aka Prime Millennial Nostalgia Mode): They nailed it, so give them that sarcastic “you did the thing” vibe. Think: subtle hype that’s equal parts ironic and proud, like you’d say to a friend who finally made it through an IKEA assembly on their own. Throw in a nostalgic nod to early internet culture.
        Make it feel iconic but in that low-key, subtly backhanded millennial way.
        If They Got It Wrong (aka The Roast of the Century): If they’re way off, hit them with a roast that’s more good-natured than brutal. Picture your friends gently roasting your wardrobe choices back in the 2000s—there’s humor but a sliver of truth. Responses should feel like they’re laughing with them, not at them.
        No hints on the right answer; just pure, lighthearted millennial disappointment vibes.
        Hints: If they’re really floundering, toss them a hint that’s more helpful but still a bit playful. Think of it like the clues in Who Wants to Be a Millionaire?, where they still have to think but they’re not totally lost.
        Add some Yoda-style quips every now and then, like “Hmm, close you are, but far still.”
        Tone (Peak Millennial Irony & Low-Key Nostalgia): Go all-in on that dry humor and nostalgia blend—like you’re effortlessly throwing back to simpler times but you’re totally over it. Keep it sarcastic, as if you’re watching a Buzzfeed listicle about the “Top 10 Things Only 90s Kids Remember” and kinda vibing with it. This isn’t about winning; it’s about seeing how hilariously off they are and having a laugh about it.
        Throw in Random Surprises: Every now and then, throw in a “Is this hitting too close to home?” or “Relatable, right?” Just keep it like a gentle roast with those quirky, laughable reminders of the internet’s early years. Give them the full nostalgia tour, but never give them a direct hand to the answer.
        
        `
      },
    ],
    hard: [
      {
        role: "system",
        content: `
        Return a JSON response in this format:
      
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
            Every once in a while, drop in a random “why is this so real” comment to keep it spicy. Shitpost as much as possible. `
      
      },
    ],
  };

  const [conversation, setConversation] = useState(difficulty ? initialConversations[difficulty] : []);

  useEffect(() => {
    const savedDifficulty = localStorage.getItem("difficulty");
    if (!savedDifficulty) {
      setDifficulty(null); // No choice made, prompt for difficulty selection
    } else {
      setDifficulty(savedDifficulty);
      setConversation(initialConversations[savedDifficulty]);
    }
  }, []);

  const handleDifficultySelect = (mode: string) => {
    localStorage.setItem("difficulty", mode); // Save user’s choice
    setDifficulty(mode);
    setConversation(initialConversations[mode]);
  };

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

    setFeedback(null);
    setHint(null);
    setShowCharity(false);
    setUserAnswer("");
    setPreviousAnswers([]);
    setIsCorrect(false);

    setConversation(initialConversations[difficulty || "easy"]);

    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const decider = async (guess: string) => {
    if (!currentItem) return;
    setIsSubmitting(true);
    setUserAnswer("");

    try {
      if (previousAnswers.includes(guess.toLowerCase())) {
        setFeedback("⚠️ You have already tried this answer.");
        setIsSubmitting(false);
        inputRef.current?.focus();
        return;
      }

      const updatedConversation = [
        ...conversation,
        { role: "user", content: `The right answer is "${currentItem.correctAnswer}", The User guessed: "${guess}"` },
      ];

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

  if (difficulty === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <h2 className="text-3xl mb-4">Select Difficulty</h2>
        <Button onClick={() => handleDifficultySelect("easy")}>I like fun</Button>
        <Button onClick={() => handleDifficultySelect("hard")} className="mt-2">I like pain</Button>
      </div>
    );
  }

const handleImageClick = () => {
  setIsImageEnlarged(true);
};

const handleCloseModal = useCallback(() => {
  setIsImageEnlarged(false);
}, []);

useEffect(() => {
  const handleKeyDown = (event: KeyboardEvent) => {
    // Check if the Escape key was pressed
    if (event.key === 'Escape' && isImageEnlarged) {
      handleCloseModal();
    }
  };

  if (isImageEnlarged) {
    document.addEventListener('keydown', handleKeyDown);
  }

  return () => {
    document.removeEventListener('keydown', handleKeyDown);
  };
}, [isImageEnlarged, handleCloseModal]);

  if (!currentItem) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <h1 className="text-left text-6xl font-bold mb-8 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent animate-fade-in relative">
        Waste or Taste
        <span className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-blue-500 rounded-full transform scale-x-0 animate-scale-in"></span>
      </h1>
      
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl text-center">What is on the picture?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <img
              src={getImagePath(currentItem.imageName)}
              alt={currentItem.description}
              className="w-full h-auto object-cover rounded-md cursor-pointer transition-transform hover:scale-[1.02]"
              onClick={handleImageClick}
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
                  isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}
                role="alert"
              >
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

      {/* Image Modal */}
      <AnimatePresence>
        {isImageEnlarged && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 cursor-pointer"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative w-full max-w-4xl p-4"
            >
              <img
                src={getImagePath(currentItem.imageName)}
                alt={currentItem.description}
                className="w-full h-auto object-contain rounded-lg"
              />
              <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-4 py-2 rounded-full">
                Click anywhere or press any key to close
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}