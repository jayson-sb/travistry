import { useState, useEffect } from "react";

const phrases = [
  "Discover where to go next",
  "Compare destinations",
  "Find hidden gems",
  "Deep-dive into the culture",
  "Get a trip plan in minutes",
  "Find the best food",
];

export const TypingText = () => {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const currentPhrase = phrases[currentPhraseIndex];

    if (isPaused) {
      const pauseTimer = setTimeout(() => {
        setIsPaused(false);
        setIsDeleting(true);
      }, 2000);
      return () => clearTimeout(pauseTimer);
    }

    if (!isDeleting && displayText === currentPhrase) {
      setIsPaused(true);
      return;
    }

    if (isDeleting && displayText === "") {
      setIsDeleting(false);
      setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
      return;
    }

    const timeout = setTimeout(() => {
      setDisplayText((prev) => {
        if (isDeleting) {
          return currentPhrase.substring(0, prev.length - 1);
        } else {
          return currentPhrase.substring(0, prev.length + 1);
        }
      });
    }, isDeleting ? 20 : 50);

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, isPaused, currentPhraseIndex]);

  return (
    <>
      {displayText}
      <span className="animate-pulse">|</span>
    </>
  );
};
