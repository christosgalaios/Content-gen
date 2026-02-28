import type { Platform } from "./plan";

export interface PipelineConfig {
  contentFolder: string;
  outputFolder: string;
  platforms: Platform[];
  videosPerRun: number;
  brand: {
    name: string;
    memberCount: string;
    ctaPhrases: string[];
    alwaysOnHashtags: string[];
  };
  claude: {
    method: "cli" | "api";
    model: string;
    maxTokensPerCall: number;
  };
  trends: {
    enabled: boolean;
    scrapeIntervalHours: number;
    maxAgeHours: number;
  };
  captions: {
    enabled: boolean;
    whisperModel: string;
  };
  render: {
    concurrency: number;
    codec: "h264" | "h265";
    crf: number;
  };
}

export type PipelineStage =
  | "ingest"
  | "trends"
  | "plan"
  | "build"
  | "render"
  | "all";

export interface StageResult {
  stage: PipelineStage;
  success: boolean;
  message: string;
  durationMs: number;
  data?: unknown;
}
