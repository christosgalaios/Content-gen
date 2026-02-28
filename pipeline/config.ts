import * as fs from "fs";
import * as path from "path";
import type { PipelineConfig } from "../types/pipeline";

const CONFIG_PATH = path.resolve(__dirname, "../pipeline.config.json");

const DEFAULT_CONFIG: PipelineConfig = {
  contentFolder: "H:\\My Drive\\Socialise\\Files\\Old Promo Content-25-02-26",
  outputFolder: "./out",
  platforms: ["tiktok", "instagram-reels", "instagram-stories"],
  videosPerRun: 7,
  brand: {
    name: "The Super Socializers",
    memberCount: "2,900+",
    ctaPhrases: [
      "Come alone. Leave with friends.",
      "Join 2,900+ members on Meetup",
      "Link in bio",
      "Your next adventure starts here",
    ],
    alwaysOnHashtags: [
      "#TheSuperSocializers",
      "#bristolsocial",
      "#meetnewpeoplebristol",
    ],
  },
  claude: {
    method: "cli",
    model: "claude-sonnet-4-20250514",
    maxTokensPerCall: 4096,
  },
  trends: {
    enabled: true,
    scrapeIntervalHours: 24,
    maxAgeHours: 48,
  },
  captions: {
    enabled: true,
    whisperModel: "medium.en",
  },
  render: {
    concurrency: 4,
    codec: "h264",
    crf: 18,
  },
};

export function loadConfig(): PipelineConfig {
  if (!fs.existsSync(CONFIG_PATH)) {
    // Write default config
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(DEFAULT_CONFIG, null, 2));
    return DEFAULT_CONFIG;
  }

  const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
  const userConfig = JSON.parse(raw);

  // Merge with defaults (user overrides take precedence)
  return deepMerge(DEFAULT_CONFIG, userConfig) as PipelineConfig;
}

function deepMerge(target: any, source: any): any {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key]) &&
      target[key] &&
      typeof target[key] === "object" &&
      !Array.isArray(target[key])
    ) {
      result[key] = deepMerge(target[key], source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}
