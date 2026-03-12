import { useMemo, useRef } from "react";
import { promptLibrary, categories } from "@/content/prompts";
import { normalize, matchesSearch } from "@/lib/prompt-helpers";
import { Effect } from "@/components/animate-ui/primitives/effects/effect";
import { HeroSection } from "./components/hero-section";
import { CategoryRow } from "./components/category-row";
import { EmptyState } from "./components/empty-state";

interface PromptsIndexProps {
  search: string;
  setSearch: (value: string) => void;
}

export const PromptsIndex = ({ search, setSearch }: PromptsIndexProps) => {
  const cardsRef = useRef<HTMLDivElement>(null);

  const promptsByCategory = useMemo(() => {
    const query = normalize(search);
    return categories.map((cat) => ({
      category: cat,
      prompts: promptLibrary.filter(
        (p) => p.category === cat && matchesSearch(p, query)
      ),
    }));
  }, [search]);

  const totalMatches = promptsByCategory.reduce(
    (sum, row) => sum + row.prompts.length,
    0
  );

  return (
    <div className="flex flex-col pb-16 sm:pb-24">
      <HeroSection
        onExploreClick={() =>
          cardsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
        }
      />

      <section ref={cardsRef} className="scroll-mt-28 mx-auto flex w-full max-w-7xl flex-col gap-8 pt-6 sm:scroll-mt-24 sm:gap-12 sm:pt-8">
        {totalMatches > 0 ? (
          promptsByCategory.map(({ category: cat, prompts }) => (
            <CategoryRow key={cat} category={cat} prompts={prompts} />
          ))
        ) : (
          <EmptyState search={search} onClear={() => setSearch("")} />
        )}

        {totalMatches > 0 && (
          <Effect
            inView
            inViewOnce
            inViewMargin="-20px"
            fade
            transition={{ type: "spring", stiffness: 200, damping: 30 }}
          >
            <div className="flex items-center justify-center pb-2 sm:pb-4">
              <p className="text-xs text-muted-foreground sm:text-sm">
                Showing <span className="font-semibold text-foreground">{totalMatches}</span> prompt{totalMatches !== 1 && "s"} across {promptsByCategory.filter((r) => r.prompts.length > 0).length} categories
              </p>
            </div>
          </Effect>
        )}
      </section>
    </div>
  );
};
