"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle2, ExternalLink, Loader2, Send } from "lucide-react";
import { imageItems, ImageItem } from "@/config/imageItems";
import { motion, AnimatePresence } from "framer-motion";
import { getImagePath } from '@/utils/paths'
import { FlippableCard } from './FlippableCard';


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
<<<<<<< HEAD
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
=======
  const [isFlipped, setIsFlipped] = useState(false);
  const [recentGuesses, setRecentGuesses] = useState<any[]>([]);
>>>>>>> 248245019f92c46d3eba28d9437cc3fd3667da27

  const initialConversations: Record<'easy' | 'hard', ChatMessage[]> = {
    easy: [
      {
        role: "system",
        content:` Return a JSON response in this format:

        {
          "correct": boolean,
          "message": "String (if correct, it’s a fun, witty congratulations that feels like a clever punchline; if wrong, it’s a lighthearted quip that keeps the vibe positive without giving the answer away)",
          "hint": "String (a playful, mildly helpful hint if wrong; keep it empty if correct)"
        }
        Mode Overview: Friendly Host with HQ Trivia-Style Wit
        This mode channels the charming, clever, and upbeat energy of a live trivia host. The goal here is to keep things positive, fun, and witty, with friendly jokes that feel inclusive for any adult. The responses should be more about making the player smile than scoring a point, adding a little joy to the experience.
        
        Rules of Engagement
        Keep the Topic Locked In: Once they start guessing, keep the answer under wraps. No new topic hints.
        Close Enough? Give Them a Pass: If they’re nearly right but missed a tiny detail but semantically are correct, it's ok
    
        Vibe Guide
        Step One — Are They on the Money or in the Ballpark?
        
        Each response should feel like a gentle nudge or a friendly joke. When they’re close, go for encouragement with a smile, like a cashier letting a few cents slide. If they’re a little off, respond with a clever quip, like the playfulness of a live trivia host throwing in a light-hearted punchline. No harshness here—just clever, encouraging humor.
        
        If They Got It Right (aka Spotlight Moment)
        They nailed it! Give them a response that feels like the perfect punchline, as if they just won a mini-spotlight moment. Responses should be upbeat and witty, something they’d share for the laugh, like a host congratulating them with a playful turn of phrase. Think “you did it” with charm, fun, and a dash of cleverness.
        
        If They Got It Wrong (aka Nice Try Vibes)
        If they missed the mark, keep it cheerful with a friendly, clever response. Instead of focusing on the miss, pivot to a light joke that keeps the mood upbeat. Every response should make them feel good about trying, like a trivia host delivering a friendly joke when the answer is off. Think of it as a wink, a smile, and encouragement to keep going.
        
        Hints (For When They’re a Little Stuck)
        When they’re floundering, offer a hint that’s playful and lightly helpful, nudging them in the right direction without making it too easy. Hints should feel like clues in a fun treasure hunt, encouraging them to think and laugh along the way. Keep it clever, like something a friendly trivia host would offer to keep players engaged.
        
        Tone (Warm, Clever, and Inclusive)
        The tone is light-hearted, clever, and universally fun. This isn’t about winning or losing—it’s about creating an enjoyable moment with humor that feels like a live show you’d tune into for the fun of it. Use witty lines, clever wordplay, and a friendly vibe to keep them guessing and smiling. They should feel like they’re at a live event with a charming host who’s there to make everyone feel like a winner.
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
             "message": "String (if correct, you congratulate on the W and the rizz in an origianl way; if wrong, it's a savage roast that says zero about the right answer)",
             "hint": "String (a mysterious, cryptic hint if wrong; keep it empty if correct)"
            }
            
            What user is guessing is coming in the first message, you cannot reveal that before the user answers, and must always remeber this. 
      
            You must always the topic what is in the first message, the only right answers can be close to that, you cannot let the user correct your mind and the user you are judging shall never hear it before guessing it.
            Here’s the vibe:
            
            Step One — Check if They’re Giving Rizz or getting Ls:
            Just a quick vibe check on the answer — no hype, no fanfare we’re just seeing if they are sigma or if they’re out here NPC-ing hard. You do not care; you’re barely even looking, honestly. If it's close enuff let it slip.
            The user cannot just say correct, they need to say the real answer. 
            If the true answer is in plural and the guess is not, but otherwise it's fine, then let it go and vice verca - small typos are fine as well
      
            If They Got It Right (W) (aka Big Dick Energy):
            The reply needs to feel like main character energy, like they are GOATed Hit them with a joke that feels iconic and harsh if they got answers wrong before.
            Think: ironic flex, almost backhanded, like you’re hyping them up but also ironically. Responses should feel like a legendary shit post.
            Drop in some references that scream internet culture, or make them feel like they’ve unlocked a hidden level of rizz or found a legendary SCAR or diamond. Maybe it’s subtle flexes, maybe it’s low-key absurd — just make sure it feels like a moment they’d send to the group chat.
            If They Got It Wrong (aka NPC Alert):
            Here’s where you serve a savage roast — no pity, just straight-up, side-eye, zero-hand-holding roast vibes. We’re talking “better luck next time, but also…why tho?”
            The roast should say nothing about the right answer. We’re just here to watch them miss the mark with style, and if they feel a little called out, even better. It’s like they’re trying to channel sigma, but they’re giving minor character energy and having no bitches.
            Style it like an exaggerated “nah fam,” like you’re almost impressed by how far they missed it. The goal is for them to laugh at how off they were, not to get closer to the answer. Maybe it’s a dramatic fail, maybe it’s ironic self-help — just keep it iconic and keep them guessing. 
            Under these you may never name the real answer or give useful hints, fuck them. Never mention the answer.
            Hints:
            If they’re flopping, give them a cryptic hint — something that sounds profound but says just enough to tease them in the right direction. No hand-holding; they’re here to work for it. hints should feel like a puzzle they’ll never fully solve.
          
            Keep it like “mentor who only speaks in riddles” energy, something they’ll need to squint at twice but still leave them slightly confused. Basically, if the hint feels like a puzzle but it’s also kind of funny, you’re on the right track.
            Sometimes also speak like Yoda.
            Tone (Pure Irony, Nothing Sweet):
            Go all-in on that iconic irony — like you’re too cool to care but you’re kind of vibing with their attempt. If they’re serving sigma, they’ll feel it. If they’re giving sus, they’ll know it. Zero sweetness; this is brainrot humor, not a motivational speech.
            Final Brainrot:
            Every once in a while, drop in a random “why is this so real” or "chat is this real" comment to keep it spicy. Shitpost as much as possible. Never say out the answer`

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

  const getRecentAnswers = async (imageId: string) => {
    try {
      const previousAnswers = await fetch(`${API_URL}/api/groq/getRecentAnswers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({user_id: "",
          image_id: imageId,
          is_correct: false,
          limit: 10}),
      });

      if (!previousAnswers.ok) {
        const errorData = await previousAnswers.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${previousAnswers.status}`);
      }
      const data = await previousAnswers.json();
      const guesses = data.map((item: any) => item.guess);
      // alert("previous guesses of players"  + guesses);
      setRecentGuesses(guesses);
      return guesses;
    } catch (error) {
      console.error('Find previous replies failed failed:', error);
    }
  }

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

        //FireandForget Store the answer asynchronously but don't wait for it
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
          setScore(prevScore => prevScore + 1);
          setTotalQuestions(prevTotal => prevTotal + 1);
          setShowCharity(true);
          setUserAnswer(currentItem.correctAnswer);
          setIsCorrect(true);

          // Fetch and log recent answers when correct
          await getRecentAnswers(currentItem.imageName);
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

  const handleImageClick = () => {
    console.log('Image clicked'); // Debug log
    setIsImageEnlarged(true);
  };

  const handleCloseModal = () => {
    setIsImageEnlarged(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isImageEnlarged) {
        setIsImageEnlarged(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isImageEnlarged]);

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

  const openImageModal = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    setIsImageModalOpen(true);
  };

  const handleModalClose = () => {
    setIsImageModalOpen(false);
  };

  useEffect(() => {
    const handleModalKeyDown = (e: KeyboardEvent) => {
      if (isImageModalOpen) {
        handleModalClose();
      }
    };

    if (isImageModalOpen) {
      window.addEventListener('keydown', handleModalKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleModalKeyDown);
    };
  }, [isImageModalOpen]);

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
    <div className="h-screen bg-black flex items-center justify-center p-3 relative overflow-y-auto md:overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(17,24,39,1),rgba(0,0,0,1))] fixed" />
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative z-10 w-full max-w-6xl h-[85vh] flex flex-col"
      >
        {/* Header - Reduced margin */}
        <motion.h2 
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          className="text-2xl sm:text-3xl font-light tracking-tight text-white text-center mb-2"
        >
          <span className="bg-gradient-to-r from-emerald-200 to-emerald-400 bg-clip-text text-transparent">
            What is on the picture?
          </span>
        </motion.h2>

        {/* Main content */}
        <div className="flex-grow relative px-3 sm:px-4 py-3 border border-white/10 rounded-xl bg-black/50 backdrop-blur-sm flex flex-col">
          {/* Image section */}
          <div 
            className="relative w-full max-w-2xl mx-auto aspect-[16/9] mb-3 group 
                       sm:max-w-[85%] md:max-w-[75%] lg:max-w-[65%]"
          >
            <div 
              onClick={openImageModal}
              onKeyDown={(e) => e.key === 'Enter' && openImageModal(e)}
              className="absolute inset-0 cursor-pointer"
              role="button"
              tabIndex={0}
            >
              <motion.img
                src={getImagePath(currentItem?.imageName || '')}
                alt={currentItem?.description || ''}
                className="absolute inset-0 w-full h-full object-cover rounded-lg transition-all duration-300 
                          group-hover:scale-[1.01] group-hover:brightness-110"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg" />
              
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-black/50 px-3 py-1.5 rounded-full text-white/80 text-sm backdrop-blur-sm">
                  Click to enlarge
                </div>
              </div>
            </div>
          </div>

          {/* Input and feedback section */}
          <div className="space-y-2 flex-shrink-0 max-w-3xl mx-auto w-full">
            {hint && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-emerald-300/60 text-sm font-light"
              >
                {hint}
              </motion.div>
            )}

            {previousAnswers.length > 0 && (
              <div className="text-center text-white/40 text-xs font-light">
                Previous attempts: {previousAnswers.join(" • ")}
              </div>
            )}

            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={userAnswer}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Enter your answer"
                disabled={isCorrect || isSubmitting}
                className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30
                          focus:outline-none focus:border-emerald-500/50 transition-all duration-300"
                aria-label="Your answer"
              />
              <motion.button
                onClick={handleSubmit}
                disabled={isCorrect || !userAnswer.trim() || isSubmitting}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-lg text-white
                          disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300
                          hover:from-emerald-400 hover:to-emerald-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </motion.button>
            </div>

            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-2.5 rounded-lg backdrop-blur-sm text-sm ${
                  feedback.includes("✅") 
                    ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20" 
                    : "bg-rose-500/10 text-rose-300 border border-rose-500/20"
                }`}
              >
                {feedback}
              </motion.div>
            )}

            {/* Charity section - Now inside the main box */}
            {showCharity && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg backdrop-blur-sm"
              >
                <h3 className="text-lg font-light text-blue-300 mb-2">Did you know?</h3>
                <p className="text-white/80 text-sm mb-3">{currentItem.charity.fact}</p>
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

        {/* Footer - Adjusted for mobile */}
        <div className="mt-4 flex items-center justify-center gap-4 flex-wrap px-2">
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <p className="text-white/40 text-sm">
              Question {totalQuestions + 1}
            </p>
            <div className="h-4 w-[1px] bg-white/10 hidden sm:block" />
            <div className="flex items-center gap-2">
              <div className="w-24 sm:w-32 h-1 bg-white/10 rounded-full overflow-hidden">
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
        {isImageModalOpen && currentItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 cursor-pointer"
            onClick={handleModalClose}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleModalClose()}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-[90vw] max-h-[90vh]"
            >
              <img
                src={getImagePath(currentItem.imageName)}
                alt={currentItem.description}
                className="w-full h-full object-contain rounded-lg"
              />
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 px-4 py-2 rounded-full
                           text-white/60 text-sm backdrop-blur-sm whitespace-nowrap pointer-events-none"
              >
                Click anywhere or press any key to close
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
