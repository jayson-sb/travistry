import { toast } from "sonner";
import {
  ChatGPTIcon,
  GeminiIcon,
  ClaudeIcon,
  PerplexityIcon,
} from "@/components/ai-service-icons";
import { buildPreamble, type PromptEntry } from "@/content/prompts";
import { trackEvent } from "@/lib/analytics/analytics";

export const normalize = (value: string) => value.trim().toLowerCase();

export const matchesSearch = (prompt: PromptEntry, query: string) => {
  if (!query) return true;
  const haystack = [prompt.title, prompt.summary, prompt.tags.join(" ")]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
};

export const buildPromptText = (prompt: PromptEntry) => {
  const preamble = buildPreamble(prompt);
  const core = prompt.promptTemplate.trim();
  return [preamble, core].filter(Boolean).join("\n\n");
};

export const extractExpectedSections = (template: string): string[] =>
  [...template.matchAll(/^\d+\.\s+(.+?):/gm)].map((m) => m[1].trim());

export const aiServices = [
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

export type AiService = (typeof aiServices)[number];

export const usePromptActions = (prompt: PromptEntry) => {
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

  const handleOpenIn = async (service: AiService) => {
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

  return { handleCopy, handleOpenIn };
};
