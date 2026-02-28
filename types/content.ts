export type MediaType = "photo" | "video";

export type ContentCategory =
  | "group-shot"
  | "hike"
  | "pub-social"
  | "activity"
  | "candid"
  | "scenic"
  | "selfie"
  | "event-setup"
  | "screenshot";

export interface MediaMetadata {
  width: number;
  height: number;
  dateTaken: string | null;
  duration: number | null; // seconds, video only
  hasAudio: boolean;
  fileSize: number;
  aspectRatio: number;
}

export interface ContentItem {
  id: string;
  filePath: string;
  fileName: string;
  mediaType: MediaType;
  metadata: MediaMetadata;
  categories: ContentCategory[];
  tags: string[];
  peopleCount: number | null;
  qualityScore: number; // 0-100
  description: string;
  usageCount: number;
  lastUsed: string | null;
  indexedAt: string;
  fileModifiedAt: string;
}
