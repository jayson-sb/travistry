import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";
import { TypingText } from "./typing-text";

interface HeroSectionProps {
  onExploreClick: () => void;
}

export const HeroSection = ({ onExploreClick }: HeroSectionProps) => (
  <section className="relative overflow-hidden bg-secondary/50 px-4 pt-16 pb-6 sm:px-6 sm:pt-24 sm:pb-10 lg:pt-28 lg:pb-12">
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
        `}</style>
      </defs>

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

      <circle className="circle-breathe-1" cx="200" cy="200" r="120" stroke="#ff3407" strokeWidth="0.8" strokeOpacity="0.135" fill="none" />
      <circle className="circle-breathe-3" cx="1250" cy="550" r="100" stroke="#ff3407" strokeWidth="0.8" strokeOpacity="0.08" fill="none" />

      <circle className="dot-glow-1" cx="720" cy="400" r="3" fill="#ff3407" fillOpacity="0.225" />
      <circle className="dot-glow-3" cx="200" cy="200" r="2.5" fill="#ff3407" fillOpacity="0.225" />
      <circle className="dot-glow-4" cx="1250" cy="550" r="2.5" fill="#ff3407" fillOpacity="0.14" />
    </svg>
    <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_55%,transparent_100%)]" />
    <div className="mx-auto flex w-full max-w-5xl flex-col items-center text-center relative z-10">
      <h1 className="mt-5 max-w-4xl text-3xl font-extrabold tracking-tight text-foreground sm:mt-7 sm:text-5xl md:text-6xl">
        <span className="block bg-gradient-to-r from-[#ff3407] to-[#ffd6cd] bg-clip-text text-transparent min-h-[1.2em]">
          <TypingText />
        </span>
        <span className="block mt-1 sm:mt-2">with Paiko</span>
      </h1>

      <p className="mt-4 max-w-sm sm:max-w-xl text-sm leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg sm:leading-relaxed">
        Your prompt travel guide. Structured prompts that get you detailed, useful answers with no back-and-forth needed
      </p>

      <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
        <Button
          size="lg"
          variant="outline"
          className="group cursor-pointer gap-2 rounded-full border-primary/20 bg-primary/5 px-8 py-3 text-sm font-medium text-primary shadow-none transition-all hover:bg-primary/10 hover:border-primary/30 hover:text-primary sm:px-10 sm:py-3.5 sm:text-base"
          onClick={onExploreClick}
        >
          Explore prompts
          <ArrowDown className="animate-bounce h-4 w-4" />
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="cursor-pointer gap-2 rounded-full border-border px-8 py-3 text-sm font-medium text-muted-foreground shadow-none transition-all hover:bg-accent hover:border-border hover:text-foreground sm:px-10 sm:py-3.5 sm:text-base"
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
    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-background pointer-events-none" />
  </section>
);
