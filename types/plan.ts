export type Platform =
  | "tiktok"
  | "instagram-reels"
  | "instagram-stories"
  | "instagram-posts";

export interface ContentPlanItem {
  id: string;
  compositionId: string;
  platform: Platform;
  props: Record<string, unknown>;
  mediaAssets: string[]; // content item IDs
  caption: string;
  hashtags: string[];
  postingTime: string; // ISO datetime
  hookStrategy: string;
  trendRefs: string[];
  estimatedRetention: number; // 0-100
  priority: number; // 1-10
}

export interface ContentPlan {
  id: string;
  generatedAt: string;
  planPeriod: { start: string; end: string };
  items: ContentPlanItem[];
  strategy: string;
}
