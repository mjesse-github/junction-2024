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

// First, let's type the conversation messages
interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export const backend = {
  async chat(messages: ChatMessage[]) {
    try {
      const response = await fetch(`${API_URL}/api/groq/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw new Error('Failed to communicate with the server. Please try again.');
    }
  },

  async submitResponse(userResponse: {
    user_id: string | null;
    image_id: string;
    category: string;
    guess: string;
    is_correct: boolean;
  }) {
    try {
      const response = await fetch(`${API_URL}/api/groq/storeAnswer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userResponse),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Store answer failed:', error);
      throw new Error('Failed to save your answer. Please try again.');
    }
  }
};

export default function GreenOrBad() {
  const [difficulty, setDifficulty] = useState<'easy' | 'hard' | null>(null); // Track difficulty
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
  const [showLanding, setShowLanding] = useState(true);

  const initialConversations: Record<'easy' | 'hard', ChatMessage[]> = {
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
        Step One — Are They a True MVP or Just Clueless? We’re doing a quick “vibe check” on the answer, no need for confetti here. If they’re kinda close, give them a pass like it’s Blockbuster and their late fee’s getting waived. If they’re totally off, go classic millennial sarcastic—like that friend who loves making snarky comments during a rom-com. And remember, if they’re not even close, keep the answer hidden like you’d keep a Myspace password.
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
      
            If They Got It Right (aka Big Dick Energy):
            The reply needs to feel like main character energy, like they are GOATed Hit them with a joke that feels iconic and harsh if they got answers wrong before.
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

  const [conversation, setConversation] = useState<Array<ChatMessage>>([]);

  const handleDifficultySelect = (mode: 'easy' | 'hard') => {
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
      const randomItem = imageItems[Math.floor(Math.random() * imageItems.length)];
      setCurrentItem(randomItem);
    } else {
      const randomItem = unseenItems[Math.floor(Math.random() * unseenItems.length)];
      setCurrentItem(randomItem);
      setSeenItems(prevSeen => new Set(prevSeen).add(randomItem.correctAnswer));
    }
  
    // Reset state variables for new item
    setFeedback(null);
    setHint(null);
    setShowCharity(false);
    setUserAnswer("");
    setPreviousAnswers([]);
    setIsCorrect(false);
  
    // Set conversation with the current item details if available
    if (currentItem) {
      setConversation([
        ...initialConversations[difficulty || "easy"],
        {
          role: "system",
          content: `The answer to the question is ${currentItem.correctAnswer}, the description of the image is ${currentItem.description}, and the category is ${currentItem.category}`
        }
      ]);
    }
  
    // Focus input after setting a new question
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

      const updatedConversation: ChatMessage[] = [
        ...conversation,
        { 
          role: "user", 
          content: `The right answer is "${currentItem.correctAnswer}", The User guessed: "${guess}"` 
        },
      ];

      try {
        const response = await backend.chat(updatedConversation);
        const result = JSON.parse(response.content);

        // Store the answer asynchronously but don't wait for it
        backend.submitResponse({
          user_id: null,
          image_id: currentItem.imageName,
          category: currentItem.category,
          guess: guess,
          is_correct: result.correct
        }).catch(error => {
          console.error('Failed to store answer:', error);
        });

        setConversation([
          ...updatedConversation,
          { role: "assistant", content: JSON.stringify(result) },
        ]);

        if (result.correct) {
          setFeedback(`✅ ${result.message}`);
          setHint(null);
          setScore(prev => prev + 1);
          setTotalQuestions(prev => prev + 1);
          setShowCharity(true);
          setUserAnswer(currentItem.correctAnswer);
          setIsCorrect(true);
        } else {
          setFeedback(`❌ ${result.message}`);
          setHint(result.hint || "💡 Here's a hint to help you out!");
          setPreviousAnswers(prev => [...prev, guess.toLowerCase()]);
        }
      } catch (error) {
        console.error('Chat processing error:', error);
        setFeedback('⚠ Failed to process your answer. Please try again.');
      }
    } catch (error) {
      console.error('Decider function error:', error);
      setFeedback('⚠️ Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
      inputRef.current?.focus();
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserAnswer(event.target.value);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (!isCorrect && userAnswer.trim()) {
        decider(userAnswer.trim());
      }
    }
  };

  const handleSubmit = () => {
    if (!isCorrect && userAnswer.trim()) {
      decider(userAnswer.trim());
    }
  };

  const handleImageClick = useCallback(() => {
    if (!currentItem) return;
    setIsImageEnlarged(true);
  }, [currentItem]);

  const handleCloseModal = useCallback(() => {
    setIsImageEnlarged(false);
  }, []);

  const handleKeyDownModal = useCallback((event: KeyboardEvent) => {
    if (isImageEnlarged) {
      handleCloseModal();
    }
  }, [isImageEnlarged, handleCloseModal]);

  useEffect(() => {
    if (isImageEnlarged) {
      document.addEventListener('keydown', handleKeyDownModal);
      return () => document.removeEventListener('keydown', handleKeyDownModal);
    }
  }, [isImageEnlarged, handleKeyDownModal]);

  const handleStartGame = () => {
    setShowLanding(false);
  };

  // Add this new event listener at the component level
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && isCorrect) {
        pickRandomUnseenItem();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isCorrect, pickRandomUnseenItem]);

  if (showLanding) {
    return (
      <div 
        className="h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden cursor-pointer"
        onClick={handleStartGame}
        onKeyDown={(e) => e.key === 'Enter' && handleStartGame()}
        tabIndex={0}
        role="button"
      >
        {/* Subtle animated gradient background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(17,24,39,1),rgba(0,0,0,1))]" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 max-w-2xl text-center space-y-16 px-4"
        >
          {/* Main title */}
          <h1 className="text-5xl sm:text-7xl font-light tracking-tight text-white">Waste <span className="text-5xl sm:text-7xl">or</span> <span className="bg-gradient-to-r from-emerald-200 to-emerald-400 bg-clip-text text-transparent">Taste</span></h1>

          {/* Objectives */}
          <div className="space-y-8">
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl font-light text-white/80"
            >
              Explore satellite imagery of Earth's most intriguing locations
            </motion.p>

            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl font-light text-white/80"
            >
              Discover the impact of human activity from space
            </motion.p>

            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-xl font-light text-white/80"
            >
              Test your knowledge of Earth observation
            </motion.p>
          </div>

          {/* Start prompt */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ delay: 0.8 }}
            className="text-sm tracking-widest text-white/50"
          >
            CLICK ANYWHERE TO BEGIN
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (difficulty === null) {
    return (
      <div className="relative min-h-screen bg-black flex flex-col items-center justify-center overflow-hidden">
        {/* Subtle animated gradient background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(17,24,39,1),rgba(0,0,0,1))]" />
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative z-10 text-center space-y-16 max-w-2xl px-4"
        >
          {/* Elegant title with subtle animation */}
          <motion.h2 
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            className="text-5xl sm:text-7xl font-light tracking-tight text-white"
          >
            Select Your
            <span className="block mt-2 font-normal bg-gradient-to-r from-emerald-200 to-emerald-400 bg-clip-text text-transparent">
              Experience
            </span>
          </motion.h2>
          
          {/* Minimalist choice buttons */}
          <div className="flex flex-col sm:flex-row gap-8 sm:gap-12">
            <motion.button
              onClick={() => handleDifficultySelect("easy")}
              className="group relative overflow-hidden"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="relative px-12 py-8 border border-emerald-500/20 rounded-lg bg-black/50 backdrop-blur-sm
                            transition-all duration-300 group-hover:border-emerald-500/40">
                <h3 className="text-2xl font-light text-white mb-3">Casual</h3>
                <p className="text-emerald-300/60 text-sm font-light">
                  Guided experience with helpful insights
                </p>
                <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gradient-to-r from-emerald-500 to-emerald-300
                              transition-all duration-300 group-hover:w-full" />
              </div>
            </motion.button>

            <motion.button
              onClick={() => handleDifficultySelect("hard")}
              className="group relative overflow-hidden"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="relative px-12 py-8 border border-rose-500/20 rounded-lg bg-black/50 backdrop-blur-sm
                            transition-all duration-300 group-hover:border-rose-500/40">
                <h3 className="text-2xl font-light text-white mb-3">Expert</h3>
                <p className="text-rose-300/60 text-sm font-light">
                  Advanced challenge with cryptic clues
                </p>
                <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gradient-to-r from-rose-500 to-rose-300
                              transition-all duration-300 group-hover:w-full" />
              </div>
            </motion.button>
          </div>

          {/* Subtle decorative element */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/30 text-sm tracking-widest"
          >
            {/* WASTE OR TASTE */}
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (!currentItem) return null;

  return (
    <div className="h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(17,24,39,1),rgba(0,0,0,1))]" />
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative z-10 w-full max-w-4xl h-[90vh] flex flex-col"
      >
        {/* Header - Now just the question title */}
        <motion.h2 
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          className="text-3xl sm:text-4xl font-light tracking-tight text-white text-center mb-4"
        >
          <span className="bg-gradient-to-r from-emerald-200 to-emerald-400 bg-clip-text text-transparent">
            What is on the picture?
          </span>
        </motion.h2>

        {/* Main content - Using flex-grow to take available space */}
        <div className="flex-grow relative px-6 py-4 border border-white/10 rounded-xl bg-black/50 backdrop-blur-sm flex flex-col">
          {/* Image section - Using relative height */}
          <div className="relative h-[45vh] mb-4 group">
            <motion.img
              src={getImagePath(currentItem?.imageName || '')}
              alt={currentItem?.description || ''}
              className="absolute inset-0 w-full h-full object-cover rounded-lg transition-all duration-300 group-hover:scale-[1.01]"
              onClick={handleImageClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleImageClick()}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg" />
          </div>

          {/* Input and feedback section - Reordered elements */}
          <div className="space-y-3 flex-shrink-0">
            {/* Hint */}
            {hint && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-emerald-300/60 text-sm font-light"
              >
                {hint}
              </motion.div>
            )}

            {/* Previous answers - Moved here */}
            {previousAnswers.length > 0 && (
              <div className="text-center text-white/40 text-xs font-light">
                Previous attempts: {previousAnswers.join(" • ")}
              </div>
            )}

            {/* Input field and submit button */}
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={userAnswer}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Enter your answer"
                disabled={isCorrect || isSubmitting}
                className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30
                           focus:outline-none focus:border-emerald-500/50 transition-all duration-300"
                aria-label="Your answer"
              />
              <motion.button
                onClick={handleSubmit}
                disabled={isCorrect || !userAnswer.trim() || isSubmitting}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-lg text-white
                           disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300
                           hover:from-emerald-400 hover:to-emerald-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isSubmitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </motion.button>
            </div>

            {/* Feedback message - Compact version */}
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-lg backdrop-blur-sm text-sm ${
                  feedback.includes("✅") 
                    ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20" 
                    : "bg-rose-500/10 text-rose-300 border border-rose-500/20"
                }`}
              >
                {feedback}
              </motion.div>
            )}

            {/* Charity section - Shown only when correct */}
            {showCharity && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg backdrop-blur-sm"
              >
                <h3 className="text-lg font-light text-blue-300 mb-2">Did you know?</h3>
                <p className="text-white/80 text-sm mb-2">{currentItem.charity.fact}</p>
                <a
                  href={currentItem.charity.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors text-sm"
                >
                  Learn more about {currentItem.charity.name} <ExternalLink className="h-4 w-4" />
                </a>
              </motion.div>
            )}
          </div>
        </div>

        {/* Updated footer with combined score and question number */}
        <div className="mt-4 flex items-center justify-center gap-8">
          <div className="flex items-center gap-4">
            <p className="text-white/40 text-sm">
              Question {totalQuestions + 1}
            </p>
            <div className="h-4 w-[1px] bg-white/10" /> {/* Vertical divider */}
            <div className="flex items-center gap-2">
              <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${(score / totalQuestions) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <p className="text-white/40 text-sm">
                {score} / {totalQuestions}
              </p>
            </div>
          </div>

          {isCorrect && (
            <motion.button
              onClick={pickRandomUnseenItem}
              className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-lg text-white text-sm
                       hover:from-emerald-400 hover:to-emerald-300 transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Next Question
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Image modal */}
      <AnimatePresence>
        {isImageEnlarged && currentItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={handleCloseModal}
          >
            <motion.img
              src={getImagePath(currentItem.imageName)}
              alt={currentItem.description}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            />
            <p className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 text-sm">
              Click anywhere to close
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}