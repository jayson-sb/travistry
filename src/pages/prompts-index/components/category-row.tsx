import { useRef, useState, useEffect, useCallback } from "react";
import { Effect } from "@/components/animate-ui/primitives/effects/effect";
import type { PromptEntry, PromptCategory } from "@/content/prompts";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PromptCard } from "./prompt-card";

const categoryAnchorId = (cat: PromptCategory) =>
  cat.toLowerCase().replace(/[^a-z0-9]+/g, "-");

const categoryDisplayLabel: Record<PromptCategory, string> = {
  Itinerary: "Build Your Itinerary",
  Stays: "Where to Stay",
  "Food & Drink": "Eat & Drink Like a Local",
  Routes: "Routes & Getting Around",
  Discovery: "Discover Hidden Gems",
  "Smart Planning": "Smart Travel Planning",
};

interface CategoryRowProps {
  category: PromptCategory;
  prompts: PromptEntry[];
}

export const CategoryRow = ({ category, prompts }: CategoryRowProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      ro.disconnect();
    };
  }, [updateScrollState, prompts]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.75;
    el.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  if (prompts.length === 0) return null;

  return (
    <div id={categoryAnchorId(category)} className="scroll-mt-28 sm:scroll-mt-24">
      <Effect
        inView
        inViewOnce
        inViewMargin="-40px"
        fade
        slide={{ direction: "up", offset: 24 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="mb-3 flex items-center justify-between px-6 sm:mb-4 sm:px-10">
          <h2 className="text-lg font-bold tracking-tight text-[#ff3407] sm:text-xl">
            {categoryDisplayLabel[category]}
          </h2>
          <span className="text-xs text-muted-foreground sm:text-sm">
            {prompts.length} prompt{prompts.length !== 1 && "s"}
          </span>
        </div>
      </Effect>

      <Effect
        inView
        inViewOnce
        inViewMargin="-20px"
        fade
        slide={{ direction: "up", offset: 32 }}
        delay={80}
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
      >
        <div className="group relative">
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-0 z-10 hidden h-full w-10 cursor-pointer items-center justify-center bg-gradient-to-r from-background/90 to-transparent transition-opacity sm:flex"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5 text-muted-foreground" />
            </button>
          )}

          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto px-6 pb-2 scrollbar-hide sm:gap-5 sm:px-10"
          >
            {prompts.map((prompt) => (
              <PromptCard key={prompt.id} prompt={prompt} />
            ))}
          </div>

          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-0 z-10 hidden h-full w-10 cursor-pointer items-center justify-center bg-gradient-to-l from-background/90 to-transparent transition-opacity sm:flex"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          )}
        </div>
      </Effect>
    </div>
  );
};
