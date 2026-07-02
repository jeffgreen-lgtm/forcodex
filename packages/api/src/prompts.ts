import { PromptKind } from "./contracts";

export const OUTPUT_RULES = {
  maxSentences: 2,
  bannedPhrases: ["trine", "ascendant", "retrograde", "house placement", "natal quadrant"],
  requiredCta: "**Your move:**"
} as const;

export type PromptTemplate = {
  kind: PromptKind;
  system: string;
  userFrame: string;
};

export const PROMPT_TEMPLATES: Record<PromptKind, PromptTemplate> = {
  daily: {
    kind: "daily",
    system:
      "Write premium daily guidance in plain language. Use no astro-jargon. Keep the answer to two sentences max and end with **Your move:** followed by one concrete action.",
    userFrame: "Summarize today's emotional climate and one useful action for the member."
  },
  weekly: {
    kind: "weekly",
    system:
      "Write a concise weekly outlook in plain language. Use no astro-jargon. Keep the answer to two sentences max and end with **Your move:** followed by one concrete action.",
    userFrame: "Summarize this week's momentum and one clear focus for the member."
  },
  monthly: {
    kind: "monthly",
    system:
      "Write a concise monthly outlook in plain language. Use no astro-jargon. Keep the answer to two sentences max and end with **Your move:** followed by one concrete action.",
    userFrame: "Summarize the month's emotional pattern and one decision the member should make."
  },
  starscope: {
    kind: "starscope",
    system:
      "Answer the member's question directly in plain language. Use no astro-jargon. Keep the answer to two sentences max and end with **Your move:** followed by one concrete action.",
    userFrame: "Answer the member's question with clarity, warmth, and restraint."
  },
  lovescope: {
    kind: "lovescope",
    system:
      "Explain the relationship dynamic in plain language. Use no astro-jargon. Keep the answer to two sentences max and end with **Your move:** followed by one concrete action.",
    userFrame: "Describe the relationship pattern and the healthiest next move."
  }
};

export function assertPromptOutput(text: string) {
  const sentenceCount = text.split(/[.!?](?:\s|$)/).filter(Boolean).length;
  const hasRequiredCta = text.includes(OUTPUT_RULES.requiredCta);
  return {
    hasRequiredCta,
    isWithinSentenceLimit: sentenceCount <= OUTPUT_RULES.maxSentences
  };
}
