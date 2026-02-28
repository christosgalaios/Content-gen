import { askClaudeVision } from "../utils/claude-client";
import { log } from "../utils/logger";
import type { ContentCategory } from "../../types/content";

interface TagResult {
  categories: ContentCategory[];
  tags: string[];
  peopleCount: number | null;
  qualityScore: number;
  description: string;
}

const VISION_PROMPT = `You are analyzing event photos for "The Super Socializers", a social meetup group in Bristol, UK.

For EACH image, respond with a JSON array (one object per image, in order). Each object:

{
  "categories": [],
  "tags": [],
  "peopleCount": null,
  "qualityScore": 0,
  "description": ""
}

Categories (pick all that apply): "group-shot", "hike", "pub-social", "activity", "candid", "scenic", "selfie", "event-setup", "screenshot"

Tags: freeform descriptive words like "outdoor", "sunny", "pub", "hiking", "large-group", "smiling", "winter", "park", "city", "river", "food", "drinks", "board-games", "walking"

peopleCount: estimated number of people visible (null if unclear or screenshot)

qualityScore: 0-100 based on:
- Composition and framing (20pts)
- Lighting quality (20pts)
- Sharpness/focus (20pts)
- Visual appeal for social media (20pts)
- Shows people having fun / engaging (20pts)

description: One sentence describing the scene.

Respond ONLY with valid JSON array. No markdown, no explanation.`;

/**
 * Tag a batch of images using Claude vision.
 * Batches of 4-6 images per call for efficiency.
 */
export async function tagImages(
  imagePaths: string[],
  batchSize: number = 4,
): Promise<Map<string, TagResult>> {
  const results = new Map<string, TagResult>();
  const batches: string[][] = [];

  for (let i = 0; i < imagePaths.length; i += batchSize) {
    batches.push(imagePaths.slice(i, i + batchSize));
  }

  for (let bi = 0; bi < batches.length; bi++) {
    const batch = batches[bi];
    log.progress(bi + 1, batches.length, `Tagging batch ${bi + 1}/${batches.length}`);

    try {
      const response = askClaudeVision(VISION_PROMPT, batch);

      if (response.parsed && Array.isArray(response.parsed)) {
        const tags = response.parsed as TagResult[];
        for (let i = 0; i < batch.length && i < tags.length; i++) {
          results.set(batch[i], {
            categories: tags[i].categories || ["candid"],
            tags: tags[i].tags || [],
            peopleCount: tags[i].peopleCount ?? null,
            qualityScore: tags[i].qualityScore || 50,
            description: tags[i].description || "",
          });
        }
      } else {
        // Fallback: assign defaults for this batch
        for (const p of batch) {
          results.set(p, {
            categories: ["candid"],
            tags: [],
            peopleCount: null,
            qualityScore: 50,
            description: "Untagged content",
          });
        }
        log.warn(`Batch ${bi + 1}: Could not parse tags, using defaults`);
      }
    } catch (err: any) {
      log.warn(`Batch ${bi + 1} failed: ${err.message}, using defaults`);
      for (const p of batch) {
        results.set(p, {
          categories: ["candid"],
          tags: [],
          peopleCount: null,
          qualityScore: 50,
          description: "Untagged content",
        });
      }
    }
  }

  return results;
}
