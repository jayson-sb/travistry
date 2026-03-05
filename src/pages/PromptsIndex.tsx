import { useMemo, useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  promptLibrary,
  buildPreamble,
  type PromptEntry,
  type PromptCategory,
} from "@/content/prompts";
import {
  ChatGPTIcon,
  GeminiIcon,
  ClaudeIcon,
  PerplexityIcon,
  // ShopBackLogo,
} from "@/components/ai-service-icons";
import { trackEvent } from "@/lib/analytics/analytics";
import { Search, Copy, ChevronDown, ArrowDown } from "lucide-react";

const normalize = (value: string) => value.trim().toLowerCase();

const matchesSearch = (prompt: PromptEntry, query: string) => {
  if (!query) return true;
  const haystack = [prompt.title, prompt.summary, prompt.tags.join(" ")]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
};

const buildPromptText = (prompt: PromptEntry) => {
  const preamble = buildPreamble(prompt);
  const core = prompt.promptTemplate.trim();
  return [preamble, core].filter(Boolean).join("\n\n");
};

const aiServices = [
  {
    name: "ChatGPT",
    icon: ChatGPTIcon,
    buildUrl: (text: string) =>
      `https://chatgpt.com/?q=${encodeURIComponent(text)}`,
    prefills: true,
  },
  {
    name: "Gemini",
    label: "Paste in Gemini",
    icon: GeminiIcon,
    buildUrl: () => `https://gemini.google.com/app`,
    prefills: false,
  },
  {
    name: "Claude",
    icon: ClaudeIcon,
    buildUrl: (text: string) =>
      `https://claude.ai/new?q=${encodeURIComponent(text)}`,
    prefills: true,
  },
  {
    name: "Perplexity",
    icon: PerplexityIcon,
    buildUrl: (text: string) =>
      `https://www.perplexity.ai/?q=${encodeURIComponent(text)}`,
    prefills: true,
  },
] as const;

const PromptCard = ({ prompt }: { prompt: PromptEntry }) => {
  const text = buildPromptText(prompt);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      trackEvent({ name: "prompt_copy", payload: { slug: prompt.id } });
      toast.success("Prompt copied to clipboard");
    } catch {
      toast.error("Copy failed. Please try again.");
    }
  };

  const handleOpenIn = async (service: (typeof aiServices)[number]) => {
    // Open the window synchronously inside the user gesture so mobile browsers
    // don't block it as a popup (async clipboard awaits would break this).
    const newTab = window.open(service.buildUrl(text), "_blank", "noreferrer");
    try {
      await navigator.clipboard.writeText(text);
      trackEvent({
        name: "outbound_click",
        payload: { slug: prompt.id, destination: service.name },
      });
      toast.success(
        service.prefills
          ? `Opening ${service.name}…`
          : `Prompt copied! Paste in ${service.name}.`
      );
    } catch {
      if (!newTab) {
        window.location.href = service.buildUrl(text);
      }
    }
  };

  return (
    <Card
      className="hover-card flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-200"
    >
      <CardHeader className="gap-1.5 px-4 pb-0 pt-3 sm:px-5 sm:pt-4">
        <Badge
          variant="secondary"
          className="w-fit rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500 sm:text-[11px]"
        >
          {prompt.category}
        </Badge>
        <CardTitle className="text-[15px] font-bold leading-snug tracking-tight text-slate-900 sm:text-base">
          {prompt.title}
        </CardTitle>
        <p className="line-clamp-2 text-xs leading-relaxed text-slate-500">
          {prompt.summary}
        </p>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-1 px-4 pb-0 pt-2 sm:px-5">
        {prompt.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center rounded-full bg-slate-50 px-1.5 py-0.5 text-[9px] font-medium text-slate-400 sm:text-[10px]"
          >
            #{tag}
          </span>
        ))}
      </CardContent>
      <CardFooter className="mt-auto px-4 pb-3 pt-3 sm:px-5 sm:pb-4">
        <div className="flex w-full items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer hover-copy h-8 flex-1 gap-1.5 rounded-lg border border-slate-200 text-[11px] font-medium text-slate-600 sm:text-xs"
            onClick={handleCopy}
          >
            <Copy className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            Copy
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                className="cursor-pointer hover-open h-8 flex-1 gap-1.5 rounded-lg bg-[#ff3407] text-[11px] font-medium text-white transition-all sm:text-xs"
              >
                Use in
                <ChevronDown className="h-3 w-3 opacity-70 sm:h-3.5 sm:w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-44 rounded-xl border-slate-100 p-1 shadow-lg"
            >
              {aiServices.map((service) => (
                <DropdownMenuItem
                  key={service.name}
                  className="cursor-pointer gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 focus:bg-[#ff3407]/5 focus:text-[#ff3407]"
                  onClick={() => handleOpenIn(service)}
                >
                  <service.icon className="h-4 w-4" />
                  {"label" in service ? service.label : service.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardFooter>
    </Card>
  );
};

const TypingText = () => {
  const phrases = [
    "Discover where to go next",
    "Compare destinations",
    "Find hidden gems",
    "Deep-dive into the culture",
    "Get a trip plan in minutes",
    "Find the best food",
  ];

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

interface PromptsIndexProps {
  search: string;
  setSearch: (value: string) => void;
  category: "all" | PromptCategory;
  setCategory: (value: "all" | PromptCategory) => void;
}

export const PromptsIndex = ({
  search,
  setSearch,
  category,
  setCategory,
}: PromptsIndexProps) => {
  const cardsRef = useRef<HTMLDivElement>(null);

  const filteredPrompts = useMemo(() => {
    const query = normalize(search);
    return promptLibrary.filter((prompt) => {
      const categoryMatch =
        category === "all" || prompt.category === category;
      return categoryMatch && matchesSearch(prompt, query);
    });
  }, [search, category]);

  const handleReset = () => {
    setSearch("");
    setCategory("all");
  };

  return (
    <div className="flex flex-col pb-16 sm:pb-24">
      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-50/50 px-4 pt-16 pb-6 sm:px-6 sm:pt-24 sm:pb-10 lg:pt-28 lg:pb-12">
        {/* Animated line graphics background */}
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 1440 800"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <style>{`
              @keyframes dash-flow {
                to { stroke-dashoffset: -200; }
              }
              @keyframes dash-flow-reverse {
                to { stroke-dashoffset: 200; }
              }
              @keyframes circle-pulse {
                0%, 100% { opacity: 0.6; }
                50% { opacity: 1; }
              }
              @keyframes dot-pulse {
                0%, 100% { opacity: 0.5; }
                50% { opacity: 1; }
              }
              @keyframes grid-drift {
                to { stroke-dashoffset: -40; }
              }
              .flow-1 {
                stroke-dasharray: 120 80;
                animation: dash-flow 10s linear infinite;
              }
              .flow-3 {
                stroke-dasharray: 140 60;
                animation: dash-flow-reverse 12s linear infinite;
              }
              .circle-breathe-1 {
                animation: circle-pulse 8s ease-in-out infinite;
              }
              .circle-breathe-3 {
                animation: circle-pulse 9s ease-in-out infinite 2s;
              }
              .dot-glow-1 {
                animation: dot-pulse 4s ease-in-out infinite;
              }
              .dot-glow-3 {
                animation: dot-pulse 5s ease-in-out infinite 1s;
              }
              .dot-glow-4 {
                animation: dot-pulse 4.5s ease-in-out infinite 2s;
              }
              .grid-line {
                animation: grid-drift 8s linear infinite;
              }
            `}</style>
          </defs>

          {/* Subtle flowing curves */}
          <path
            className="flow-1"
            d="M-100 600 C200 450, 500 700, 720 400 S1100 200, 1540 350"
            stroke="#ff3407"
            strokeWidth="1.5"
            strokeOpacity="0.162"
            fill="none"
          />
          <path
            className="flow-3"
            d="M-100 200 C150 350, 400 100, 720 300 S1050 500, 1540 250"
            stroke="#ff3407"
            strokeWidth="1.5"
            strokeOpacity="0.135"
            fill="none"
          />

          {/* Geometric circles */}
          <circle className="circle-breathe-1" cx="200" cy="200" r="120" stroke="#ff3407" strokeWidth="0.8" strokeOpacity="0.135" fill="none" />
          <circle className="circle-breathe-3" cx="1250" cy="550" r="100" stroke="#ff3407" strokeWidth="0.8" strokeOpacity="0.08" fill="none" />

          {/* Accent dots */}
          <circle className="dot-glow-1" cx="720" cy="400" r="3" fill="#ff3407" fillOpacity="0.225" />
          <circle className="dot-glow-3" cx="200" cy="200" r="2.5" fill="#ff3407" fillOpacity="0.225" />
          <circle className="dot-glow-4" cx="1250" cy="550" r="2.5" fill="#ff3407" fillOpacity="0.14" />

          {/* Subtle grid lines */}
          <line className="grid-line" x1="0" y1="200" x2="1440" y2="200" stroke="#cbd5e1" strokeWidth="0.4" strokeOpacity="0.27" strokeDasharray="8 16" />
          <line className="grid-line" x1="0" y1="400" x2="1440" y2="400" stroke="#cbd5e1" strokeWidth="0.4" strokeOpacity="0.27" strokeDasharray="8 16" />
          <line className="grid-line" x1="0" y1="600" x2="1440" y2="600" stroke="#cbd5e1" strokeWidth="0.4" strokeOpacity="0.27" strokeDasharray="8 16" />
        </svg>
        {/* Radial fade mask over the lines */}
        <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_55%,transparent_100%)]" />
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center text-center relative z-10">
          <h1 className="mt-5 max-w-4xl text-3xl font-extrabold tracking-tight text-slate-900 sm:mt-7 sm:text-5xl md:text-6xl">
            <span className="block bg-gradient-to-r from-[#ff3407] to-[#ffd6cd] bg-clip-text text-transparent min-h-[1.2em]">
              <TypingText />
            </span>
            <span className="block mt-1 sm:mt-2">like a smart traveler</span>
          </h1>

          <p className="mt-4 max-w-sm sm:max-w-xl text-sm leading-relaxed text-slate-500 sm:mt-6 sm:text-lg sm:leading-relaxed">
            Smart travel prompts for your next trip. Build itineraries, compare and discover based on your needs.
          </p>

          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Button
              size="lg"
              variant="outline"
              className="group cursor-pointer gap-2 rounded-full border-primary/20 bg-primary/5 px-8 py-3 text-sm font-medium text-primary shadow-none transition-all hover:bg-primary/10 hover:border-primary/30 hover:text-primary sm:px-10 sm:py-3.5 sm:text-base"
              onClick={() => {
                cardsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              Explore prompts
              <ArrowDown className="animate-bounce h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="cursor-pointer gap-2 rounded-full border-slate-300 px-8 py-3 text-sm font-medium text-slate-600 shadow-none transition-all hover:bg-slate-100 hover:border-slate-400 hover:text-slate-800 sm:px-10 sm:py-3.5 sm:text-base"
              asChild
            >
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLSf0sfiESG6UJGv8-p8eJKszaf7qKcUu4VF_1OWEG98uYD7DKA/viewform"
                target="_blank"
                rel="noopener noreferrer"
              >
                Share feedback
              </a>
            </Button>
          </div>
        </div>
        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-white pointer-events-none" />
      </section>

      {/* Main Content */}
      <section ref={cardsRef} className="scroll-mt-28 mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pt-6 sm:scroll-mt-24 sm:gap-10 sm:px-6 sm:pt-8">

        {/* Cards Grid */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
          {filteredPrompts.map((prompt) => (
            <PromptCard key={prompt.id} prompt={prompt} />
          ))}
        </div>

        {/* Results count */}
        {filteredPrompts.length > 0 && (
          <div className="flex items-center justify-center pt-1 pb-2 sm:pt-2 sm:pb-4">
            <p className="text-xs text-muted-foreground sm:text-sm">
              Showing <span className="font-semibold text-foreground">{filteredPrompts.length}</span> prompt{filteredPrompts.length !== 1 && "s"}
            </p>
          </div>
        )}

        {/* Empty State */}
        {filteredPrompts.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/60 bg-slate-50/50 px-4 py-16 text-center sm:gap-4 sm:rounded-3xl sm:py-24">
            <div className="rounded-full bg-slate-100 p-3 sm:p-4">
              <Search className="h-6 w-6 text-muted-foreground/50 sm:h-8 sm:w-8" />
            </div>
            <div className="max-w-md space-y-1.5 sm:space-y-2">
              <h3 className="text-lg font-semibold text-foreground sm:text-xl">No prompts found</h3>
              <p className="text-sm text-muted-foreground sm:text-base">
                We couldn't find any prompts matching "{search}". Try adjusting your search or filters.
              </p>
            </div>
            <Button variant="outline" onClick={handleReset} className="cursor-pointer mt-2 rounded-full text-sm sm:mt-4">
              Clear all filters
            </Button>
          </div>
        )}
      </section>
    </div>
  );
};
