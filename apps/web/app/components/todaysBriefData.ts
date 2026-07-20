export type StructuredDailyBrief = {
  headline: string;
  learnYourSky?: string;
  noticeWhen: string[];
  whyTodayFeelsThisWay: string[];
  yourMove: string;
};

export type ResolvedTodaysBrief = {
  headline: string;
  learnYourSky?: string;
  noticeWhen: string[];
  whyTodayFeelsThisWay: string[];
  yourMove: string;
};

function splitParagraphs(text: string | null | undefined) {
  if (!text) {
    return [];
  }

  return text
    .split(/\n\s*\n/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);
}

function splitSentences(text: string | null | undefined) {
  if (!text) {
    return [];
  }

  return text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function cleanSectionHeading(text: string) {
  return text.replace(/^\*\*|\*\*$/g, "").replace(/:$/, "").trim().toLowerCase();
}

function stripMoveLabel(text: string | null | undefined) {
  if (!text) {
    return "";
  }

  return text.replace(/\n*\s*\*\*Your move:\*\*[\s\S]*$/i, "").trim();
}

function extractMoveText(text: string | null | undefined) {
  if (!text) {
    return "";
  }

  const match = text.match(/\*\*Your move:\*\*\s*([\s\S]*)$/i);
  return match?.[1]?.trim() ?? "";
}

function sanitizeStructuredDailyBrief(value: StructuredDailyBrief | null | undefined) {
  if (!value) {
    return null;
  }

  const headline = value.headline?.trim();
  const yourMove = value.yourMove?.trim();
  const whyTodayFeelsThisWay = Array.isArray(value.whyTodayFeelsThisWay)
    ? value.whyTodayFeelsThisWay.map((item) => item.trim()).filter(Boolean)
    : [];
  const noticeWhen = Array.isArray(value.noticeWhen)
    ? value.noticeWhen.map((item) => item.trim()).filter(Boolean).slice(0, 3)
    : [];
  const learnYourSky = value.learnYourSky?.trim();

  if (!headline || !yourMove || !whyTodayFeelsThisWay.length) {
    return null;
  }

  return {
    headline,
    learnYourSky: learnYourSky || undefined,
    noticeWhen,
    whyTodayFeelsThisWay,
    yourMove
  } satisfies ResolvedTodaysBrief;
}

function parseLegacyDailyBrief(text: string, fallbackHeadline: string) {
  const paragraphs = splitParagraphs(text);
  const noticeWhen: string[] = [];
  const whyToday: string[] = [];
  let learnYourSky = "";

  for (let index = 0; index < paragraphs.length; index += 1) {
    const paragraph = paragraphs[index];
    const lines = paragraph
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (!lines.length) {
      continue;
    }

    const heading = cleanSectionHeading(lines[0]);
    if (heading === "notice when" || heading === "watch for") {
      noticeWhen.push(
        ...lines
          .slice(1)
          .map((line) => line.replace(/^[-*•]\s*/, "").replace(/^\d+[.)]\s*/, "").trim())
          .filter(Boolean)
      );
      continue;
    }

    if (heading === "why today feels this way" || heading === "why today") {
      whyToday.push(...lines.slice(1).map((line) => line.trim()).filter(Boolean));
      continue;
    }

    if (heading === "learn your sky") {
      learnYourSky = lines.slice(1).join(" ").trim();
      continue;
    }

    if (index > 0) {
      whyToday.push(paragraph.trim());
    }
  }

  const firstParagraph = paragraphs[0] ?? fallbackHeadline;
  const headline =
    splitSentences(firstParagraph).find((sentence) => sentence.replace(/\*\*/g, "").trim().length > 12) ??
    fallbackHeadline;

  const move = extractMoveText(text) || "Choose one practical action that makes the day easier to move through.";
  const whyTodayFeelsThisWay = whyToday.length ? whyToday : paragraphs.slice(1);

  return {
    headline: headline.trim() || fallbackHeadline,
    learnYourSky: learnYourSky || undefined,
    noticeWhen: noticeWhen.slice(0, 3),
    whyTodayFeelsThisWay: whyTodayFeelsThisWay.length ? whyTodayFeelsThisWay : [stripMoveLabel(text) || fallbackHeadline],
    yourMove: move
  } satisfies ResolvedTodaysBrief;
}

export function resolveTodaysBriefData(input: {
  content: string;
  fallbackHeadline: string;
  structuredDailyBrief?: StructuredDailyBrief | null;
}) {
  const structured = sanitizeStructuredDailyBrief(input.structuredDailyBrief);
  if (structured) {
    return structured;
  }

  return parseLegacyDailyBrief(input.content, input.fallbackHeadline);
}
