import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { promptLibrary, buildPreamble } from "@/content/prompts";
import {
  ChatGPTIcon,
  GeminiIcon,
  ClaudeIcon,
  PerplexityIcon,
} from "@/components/ai-service-icons";
import { trackEvent } from "@/lib/analytics/analytics";
import { ChevronDown } from "lucide-react";

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

const hydrateTemplate = (template: string, values: Record<string, string>) =>
  template.replace(/\[([A-Z][A-Z0-9_]*)\]/g, (_match, key) => {
    const lower = key.toLowerCase();
    return values[lower] || `[${key}]`;
  });

export const PromptDetail = ({ slug }: { slug?: string }) => {
  const prompt = useMemo(
    () => promptLibrary.find((entry) => entry.slug === slug),
    [slug]
  );

  const [values, setValues] = useState<Record<string, string>>(() => {
    if (!prompt?.variables?.length) return {};
    return prompt.variables.reduce<Record<string, string>>((acc, variable) => {
      acc[variable.key] = "";
      return acc;
    }, {});
  });

  useEffect(() => {
    if (!prompt?.variables?.length) {
      setValues({});
      return;
    }

    setValues(
      prompt.variables.reduce<Record<string, string>>((acc, variable) => {
        acc[variable.key] = "";
        return acc;
      }, {})
    );
  }, [prompt?.slug]);

  if (!prompt) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-6 py-16">
        <h1 className="text-3xl font-semibold">Prompt not found</h1>
        <p className="text-muted-foreground">
          The prompt you&apos;re looking for doesn&apos;t exist yet.
        </p>
        <Button asChild>
          <a href="/prompts">Back to all prompts</a>
        </Button>
      </div>
    );
  }

  const renderedPrompt = hydrateTemplate(prompt.promptTemplate, values);
  const copyablePrompt = buildPreamble(prompt) + "\n\n" + renderedPrompt;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyablePrompt);
      trackEvent({
        name: "prompt_copy",
        payload: {
          slug: prompt.slug,
          variables: values,
        },
      });
      toast.success("Prompt copied to clipboard");
    } catch (error) {
      toast.error("Copy failed. Please try again.");
      console.error(error);
    }
  };

  useEffect(() => {
    trackEvent({
      name: "prompt_view",
      payload: { slug: prompt.slug },
    });
  }, [prompt.slug]);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-16">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="uppercase tracking-wide">
            {prompt.intent}
          </Badge>
          <Badge variant="outline">{prompt.category}</Badge>
        </div>
        <h1 className="text-4xl font-bold">{prompt.title}</h1>
        <p className="text-base text-muted-foreground">{prompt.summary}</p>
        <div className="flex flex-wrap gap-2">
          {prompt.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="border-border/70 shadow-card-soft">
          <CardHeader className="gap-2">
            <CardTitle>Prompt template</CardTitle>
            <CardDescription>{prompt.purpose}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {prompt.variables?.length ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {prompt.variables.map((variable) => (
                  <div key={variable.key} className="space-y-2">
                    <label className="text-sm font-medium">
                      {variable.label}
                    </label>
                    <Input
                      placeholder={variable.placeholder}
                      value={values[variable.key] ?? ""}
                      onChange={(event) =>
                        setValues((prev) => ({
                          ...prev,
                          [variable.key]: event.target.value,
                        }))
                      }
                    />
                    {variable.example ? (
                      <p className="text-xs text-muted-foreground">
                        Example: {variable.example}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}

            <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
              <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                {renderedPrompt}
              </pre>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button onClick={handleCopy}>Copy prompt</Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    Open in…
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  {aiServices.map((service) => (
                    <DropdownMenuItem
                      key={service.name}
                      className="cursor-pointer gap-2"
                      onClick={async () => {
                        const newTab = window.open(
                          service.buildUrl(copyablePrompt),
                          "_blank",
                          "noreferrer"
                        );
                        try {
                          await navigator.clipboard.writeText(copyablePrompt);
                          trackEvent({
                            name: "outbound_click",
                            payload: {
                              slug: prompt.slug,
                              destination: service.name,
                            },
                          });
                          toast.success(
                            service.prefills
                              ? `Opening ${service.name}…`
                              : `Prompt copied! Paste in ${service.name}.`
                          );
                        } catch {
                          if (!newTab) {
                            window.location.href =
                              service.buildUrl(copyablePrompt);
                          }
                        }
                      }}
                    >
                      <service.icon className="h-4 w-4" />
                      {"label" in service ? service.label : service.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>

        <Card className="h-fit border-border/70 bg-white shadow-card-soft">
          <CardHeader>
            <CardTitle>When to use this prompt</CardTitle>
            <CardDescription>
              Recommended contexts for best results.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              {(prompt.whenToUse ?? []).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <Separator />
            <div className="space-y-2">
              <p className="text-sm font-semibold">Need more help?</p>
              <p className="text-sm text-muted-foreground">
                Explore more prompts or share feedback to refine this template.
              </p>
              <Button asChild variant="secondary" className="w-full">
                <a href="/prompts">Browse all prompts</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
