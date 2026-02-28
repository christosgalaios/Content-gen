import { log } from "../utils/logger";

/**
 * Known composition schemas with their required and optional fields.
 * Used to validate props before rendering.
 */
const COMPOSITION_SCHEMAS: Record<string, { required: string[]; optional: string[] }> = {
  "EventPromo": {
    required: ["eventName", "eventDate", "eventTime", "eventLocation", "eventType"],
    optional: ["backgroundImage", "memberCount"],
  },
  "Testimonial": {
    required: ["quote", "name"],
    optional: ["memberSince", "backgroundImage"],
  },
  "HookReel": {
    required: ["hookText", "bodyLines", "ctaText"],
    optional: ["backgroundImage"],
  },
  "TextAnimation": {
    required: ["lines"],
    optional: ["backgroundColor", "textColor", "accentColor"],
  },
  "PhotoMontage": {
    required: ["images"],
    optional: ["overlayText", "ctaText"],
  },
  "CountdownEvent": {
    required: ["eventName", "daysLeft", "eventType"],
    optional: ["spotsLeft", "highlights", "backgroundImage"],
  },
  "StatsShowcase": {
    required: ["stats", "headline"],
    optional: ["ctaText"],
  },
  // New compositions
  "POVReveal": {
    required: ["hookText", "stages", "ctaText"],
    optional: ["photos"],
  },
  "BeforeAfter": {
    required: ["beforeText", "afterText", "revealText"],
    optional: ["backgroundImage"],
  },
  "ListCountdown": {
    required: ["title", "items"],
    optional: ["ctaText"],
  },
  "StoryTime": {
    required: ["storyText"],
    optional: ["backgroundImage"],
  },
  "PhotoDump": {
    required: ["title", "photos"],
    optional: ["ctaText"],
  },
  "TransitionReveal": {
    required: ["hookText", "revealText"],
    optional: ["backgroundImage"],
  },
};

/**
 * Validate props against a composition's known schema.
 * Returns { valid, errors }.
 */
export function validateProps(
  compositionId: string,
  props: Record<string, unknown>,
): { valid: boolean; errors: string[] } {
  // Extract base name (e.g., "EventPromo-TikTok" -> "EventPromo")
  const baseName = compositionId.replace(/-(?:TikTok|Insta|Story)$/, "");
  const schema = COMPOSITION_SCHEMAS[baseName];

  if (!schema) {
    return {
      valid: true,
      errors: [`Unknown composition: ${baseName}, skipping validation`],
    };
  }

  const errors: string[] = [];

  for (const field of schema.required) {
    if (!(field in props) || props[field] === undefined || props[field] === null) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Type-specific checks
  if (baseName === "HookReel" && props.bodyLines) {
    if (!Array.isArray(props.bodyLines)) {
      errors.push("bodyLines must be an array");
    }
  }

  if (baseName === "TextAnimation" && props.lines) {
    if (!Array.isArray(props.lines)) {
      errors.push("lines must be an array");
    }
  }

  if (baseName === "StatsShowcase" && props.stats) {
    if (!Array.isArray(props.stats)) {
      errors.push("stats must be an array");
    }
  }

  if (baseName === "CountdownEvent" && props.daysLeft !== undefined) {
    if (typeof props.daysLeft !== "number") {
      errors.push("daysLeft must be a number");
    }
  }

  if (errors.length > 0) {
    log.warn(`Validation errors for ${compositionId}: ${errors.join(", ")}`);
  }

  return { valid: errors.length === 0, errors };
}
