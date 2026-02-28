export type TrendSource =
  | "tiktok-creative-center"
  | "claude-web-search"
  | "manual";

export interface Trend {
  id: string;
  source: TrendSource;
  category: "hashtag" | "sound" | "format" | "topic";
  name: string;
  description: string;
  relevanceScore: number; // 0-100
  popularityScore: number; // 0-100
  suggestedFormat: string | null;
  scrapedAt: string;
  expiresAt: string;
}

export interface TrendMatch {
  trend: Trend;
  matchedContentIds: string[];
  compositionSuggestion: string;
  confidence: number; // 0-1
}
