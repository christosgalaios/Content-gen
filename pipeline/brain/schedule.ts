import type { Platform } from "../../types/plan";

interface PostingSlot {
  dayOfWeek: number; // 0=Sun, 1=Mon, ..., 6=Sat
  hour: number; // 0-23 UK time
  platform: Platform;
  priority: number; // higher = better
}

/**
 * Optimal posting times based on algorithm research.
 * All times in UK timezone (GMT/BST).
 */
const OPTIMAL_SLOTS: PostingSlot[] = [
  // TikTok: Tue-Thu 2-5PM best, also 7-9PM good
  { dayOfWeek: 2, hour: 15, platform: "tiktok", priority: 10 },
  { dayOfWeek: 3, hour: 15, platform: "tiktok", priority: 10 },
  { dayOfWeek: 4, hour: 14, platform: "tiktok", priority: 9 },
  { dayOfWeek: 2, hour: 19, platform: "tiktok", priority: 8 },
  { dayOfWeek: 3, hour: 20, platform: "tiktok", priority: 8 },
  { dayOfWeek: 5, hour: 17, platform: "tiktok", priority: 7 },
  { dayOfWeek: 1, hour: 18, platform: "tiktok", priority: 6 },
  { dayOfWeek: 6, hour: 11, platform: "tiktok", priority: 5 },
  { dayOfWeek: 0, hour: 12, platform: "tiktok", priority: 5 },

  // Instagram Reels: Similar to TikTok but slightly earlier
  { dayOfWeek: 2, hour: 14, platform: "instagram-reels", priority: 10 },
  { dayOfWeek: 3, hour: 13, platform: "instagram-reels", priority: 9 },
  { dayOfWeek: 4, hour: 15, platform: "instagram-reels", priority: 9 },
  { dayOfWeek: 5, hour: 12, platform: "instagram-reels", priority: 7 },
  { dayOfWeek: 1, hour: 17, platform: "instagram-reels", priority: 6 },

  // Instagram Stories: Morning + evening peaks
  { dayOfWeek: 2, hour: 9, platform: "instagram-stories", priority: 9 },
  { dayOfWeek: 3, hour: 18, platform: "instagram-stories", priority: 9 },
  { dayOfWeek: 4, hour: 9, platform: "instagram-stories", priority: 8 },
  { dayOfWeek: 5, hour: 17, platform: "instagram-stories", priority: 7 },

  // Instagram Posts: Midday weekdays
  { dayOfWeek: 2, hour: 12, platform: "instagram-posts", priority: 9 },
  { dayOfWeek: 3, hour: 11, platform: "instagram-posts", priority: 8 },
  { dayOfWeek: 4, hour: 13, platform: "instagram-posts", priority: 8 },
];

/**
 * Get the next N optimal posting times starting from a given date.
 */
export function getPostingSchedule(
  platforms: Platform[],
  count: number,
  startDate: Date = new Date(),
): string[] {
  const slots = OPTIMAL_SLOTS
    .filter((s) => platforms.includes(s.platform))
    .sort((a, b) => b.priority - a.priority);

  const schedule: string[] = [];
  const currentDate = new Date(startDate);

  // Find the next occurrence of each slot
  for (let weekOffset = 0; weekOffset < 4 && schedule.length < count; weekOffset++) {
    for (const slot of slots) {
      if (schedule.length >= count) break;

      const target = new Date(currentDate);
      target.setDate(target.getDate() + ((slot.dayOfWeek - target.getDay() + 7) % 7) + weekOffset * 7);
      target.setHours(slot.hour, 0, 0, 0);

      // Skip if in the past
      if (target <= startDate) continue;

      schedule.push(target.toISOString());
    }
  }

  return schedule.slice(0, count);
}
