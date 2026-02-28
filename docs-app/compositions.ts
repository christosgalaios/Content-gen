import React from "react";
import { EventPromo } from "../src/compositions/EventPromo";
import { Testimonial } from "../src/compositions/Testimonial";
import { HookReel } from "../src/compositions/HookReel";
import { TextAnimation } from "../src/compositions/TextAnimation";
import { CountdownEvent } from "../src/compositions/CountdownEvent";
import { StatsShowcase } from "../src/compositions/StatsShowcase";
import { PhotoMontage } from "../src/compositions/PhotoMontage";
import { POVReveal } from "../src/compositions/POVReveal";
import { BeforeAfter } from "../src/compositions/BeforeAfter";
import { ListCountdown } from "../src/compositions/ListCountdown";
import { StoryTime } from "../src/compositions/StoryTime";
import { PhotoDump } from "../src/compositions/PhotoDump";
import { TransitionReveal } from "../src/compositions/TransitionReveal";
import { QuizPoll } from "../src/compositions/QuizPoll";
import { MemberMilestone } from "../src/compositions/MemberMilestone";
import { WeeklyRecap } from "../src/compositions/WeeklyRecap";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type Platform = "tiktok" | "instagram-stories" | "instagram-posts";

export interface PlatformConfig {
  width: number;
  height: number;
  durationInFrames: number;
  suffix: string;
}

export interface FieldDef {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "color" | "select" | "array" | "stats" | "events";
  required?: boolean;
  default: unknown;
  opts?: string[]; // for select fields
}

export interface CompositionEntry {
  component: React.FC<any>;
  platforms: Record<string, PlatformConfig>;
  engagementTier: "high" | "medium" | "standard";
  bestFor: string[];
  needsPhotos: boolean;
  desc: string;
  fields: FieldDef[];
}

// ---------------------------------------------------------------------------
// Platform configs
// ---------------------------------------------------------------------------
const TK = (dur: number): PlatformConfig => ({
  width: 1080,
  height: 1920,
  durationInFrames: dur,
  suffix: "TikTok",
});
const ST = (dur: number): PlatformConfig => ({
  width: 1080,
  height: 1920,
  durationInFrames: dur,
  suffix: "Story",
});
const IN = (dur: number): PlatformConfig => ({
  width: 1080,
  height: 1080,
  durationInFrames: dur,
  suffix: "Insta",
});

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------
export const REGISTRY: Record<string, CompositionEntry> = {
  EventPromo: {
    component: EventPromo,
    platforms: { tiktok: TK(450), "instagram-stories": ST(300), "instagram-posts": IN(450) },
    engagementTier: "medium",
    bestFor: ["event-promotion", "upcoming-event", "announcement", "promote", "event"],
    needsPhotos: false,
    desc: "Bold event announcement with date, time, location",
    fields: [
      { key: "eventName", label: "Event Name", type: "text", required: true, default: "Saturday Bristol Walk" },
      { key: "eventDate", label: "Date", type: "text", required: true, default: "This Saturday" },
      { key: "eventTime", label: "Time", type: "text", required: true, default: "11:00 AM" },
      { key: "eventLocation", label: "Location", type: "text", required: true, default: "Bristol Harbourside" },
      { key: "eventType", label: "Type", type: "select", opts: ["Social", "Hike", "Pub Social", "Speed Friending", "Games", "Comedy", "Festival", "Coffee Social", "Walk", "Activity"], default: "Social" },
      { key: "memberCount", label: "Member Count", type: "text", default: "2,900+" },
    ],
  },

  Testimonial: {
    component: Testimonial,
    platforms: { tiktok: TK(300), "instagram-stories": ST(300) },
    engagementTier: "high",
    bestFor: ["social-proof", "member-story", "review", "testimonial", "quote"],
    needsPhotos: false,
    desc: "Member quote with name and join date",
    fields: [
      { key: "quote", label: "Quote", type: "textarea", required: true, default: "I moved to Bristol knowing nobody. Found this group and now I have an actual social life!" },
      { key: "name", label: "Name", type: "text", required: true, default: "Sarah" },
      { key: "memberSince", label: "Member Since", type: "text", default: "2023" },
    ],
  },

  HookReel: {
    component: HookReel,
    platforms: { tiktok: TK(450), "instagram-stories": ST(300) },
    engagementTier: "high",
    bestFor: ["pov", "narrative", "hook", "story", "progression", "relatable", "moving"],
    needsPhotos: false,
    desc: "POV-style hook with progressive body lines",
    fields: [
      { key: "hookText", label: "Hook", type: "text", required: true, default: "POV: You just moved to Bristol" },
      { key: "bodyLines", label: "Body Lines", type: "array", default: ["Week 1: Eating alone every night", "Week 2: Scrolling Meetup at 2am", "Week 3: Finally show up to a walk", "Week 4: 10 new friends, 3 group chats"] },
      { key: "ctaText", label: "CTA", type: "text", default: "Come alone. Leave with friends." },
    ],
  },

  TextAnimation: {
    component: TextAnimation,
    platforms: { tiktok: TK(300) },
    engagementTier: "standard",
    bestFor: ["message", "text-only", "awareness", "values", "brand", "kinetic"],
    needsPhotos: false,
    desc: "Kinetic text animation with brand colors",
    fields: [
      { key: "lines", label: "Lines", type: "array", default: ["90% of people come alone", "That's totally normal", "Zero pressure. Zero drama.", "Just good vibes."] },
      { key: "backgroundColor", label: "Background", type: "color", default: "#1A1A2E" },
      { key: "textColor", label: "Text Color", type: "color", default: "#FFFFFF" },
      { key: "accentColor", label: "Accent", type: "color", default: "#FF6B35" },
    ],
  },

  CountdownEvent: {
    component: CountdownEvent,
    platforms: { tiktok: TK(450), "instagram-stories": ST(300) },
    engagementTier: "high",
    bestFor: ["urgency", "countdown", "limited-spots", "deadline", "fomo", "days"],
    needsPhotos: false,
    desc: "Countdown timer with spots-left urgency",
    fields: [
      { key: "eventName", label: "Event Name", type: "text", required: true, default: "Speed Friending Night" },
      { key: "daysLeft", label: "Days Left", type: "number", default: 3 },
      { key: "spotsLeft", label: "Spots Left", type: "number", default: 12 },
      { key: "eventType", label: "Type", type: "select", opts: ["Social", "Hike", "Pub Social", "Speed Friending", "Games", "Comedy", "Quiz Night", "Festival"], default: "Speed Friending" },
      { key: "highlights", label: "Highlights", type: "array", default: ["Meet 20+ new people", "Structured icebreakers", "Drinks & good vibes"] },
    ],
  },

  StatsShowcase: {
    component: StatsShowcase,
    platforms: { tiktok: TK(450), "instagram-stories": ST(300), "instagram-posts": IN(360) },
    engagementTier: "medium",
    bestFor: ["numbers", "stats", "social-proof", "milestones", "growth", "data"],
    needsPhotos: false,
    desc: "Animated stat counters with labels",
    fields: [
      { key: "headline", label: "Headline", type: "text", default: "The Super Socializers" },
      { key: "stats", label: "Stats", type: "stats", default: [{ value: 2900, suffix: "+", label: "Members & counting" }, { value: 90, suffix: "%", label: "Come alone" }, { value: 500, suffix: "+", label: "Events hosted" }] },
      { key: "ctaText", label: "CTA", type: "text", default: "Be part of the story" },
    ],
  },

  PhotoMontage: {
    component: PhotoMontage,
    platforms: { "instagram-posts": IN(300) },
    engagementTier: "medium",
    bestFor: ["photo-showcase", "highlights", "recap", "montage", "gallery"],
    needsPhotos: true,
    desc: "Photo grid montage with overlay text",
    fields: [
      { key: "images", label: "Image Paths", type: "array", default: [] },
      { key: "overlayText", label: "Overlay Text", type: "text", default: "This could be your weekend" },
      { key: "ctaText", label: "CTA", type: "text", default: "Join 2,900+ members on Meetup" },
    ],
  },

  POVReveal: {
    component: POVReveal,
    platforms: { tiktok: TK(435) },
    engagementTier: "high",
    bestFor: ["pov", "relatable", "story-arc", "discovery", "journey", "reveal"],
    needsPhotos: true,
    desc: "Multi-stage POV with photo reveals",
    fields: [
      { key: "hookText", label: "Hook", type: "text", default: "POV: You just moved to Bristol" },
      { key: "stages", label: "Stages", type: "array", default: ["Week 1: Eating alone every night", "Week 2: Finally show up to a walk", "Week 3: Speed friending night", "Week 4: 10 new friends, 3 group chats"] },
      { key: "ctaText", label: "CTA", type: "text", default: "Come alone. Leave with friends." },
      { key: "photos", label: "Photo Paths", type: "array", default: [] },
    ],
  },

  BeforeAfter: {
    component: BeforeAfter,
    platforms: { tiktok: TK(390), "instagram-stories": ST(300) },
    engagementTier: "high",
    bestFor: ["transformation", "before-after", "contrast", "glow-up", "before", "after"],
    needsPhotos: false,
    desc: "Before/after contrast with dramatic reveal",
    fields: [
      { key: "beforeText", label: "Before", type: "text", default: "Before: scrolling alone at midnight" },
      { key: "afterText", label: "After", type: "text", default: "After: 10 new friends in 4 weeks" },
      { key: "revealText", label: "Reveal", type: "text", default: "The Super Socializers" },
    ],
  },

  ListCountdown: {
    component: ListCountdown,
    platforms: { tiktok: TK(495), "instagram-stories": ST(300) },
    engagementTier: "medium",
    bestFor: ["listicle", "reasons", "tips", "information", "list", "top", "why"],
    needsPhotos: false,
    desc: "Numbered list with animated items",
    fields: [
      { key: "title", label: "Title", type: "text", default: "5 reasons to join The Super Socializers" },
      { key: "items", label: "List Items", type: "array", default: ["90% of people come alone", "500+ events hosted since 2023", "Hikes, pubs, games, festivals", "Strictly platonic, zero drama", "Bristol's friendliest community"] },
      { key: "ctaText", label: "CTA", type: "text", default: "Your next adventure starts here" },
    ],
  },

  StoryTime: {
    component: StoryTime,
    platforms: { tiktok: TK(360), "instagram-stories": ST(300) },
    engagementTier: "high",
    bestFor: ["storytime", "caption-driven", "narrative", "personal", "story"],
    needsPhotos: false,
    desc: "Caption-style personal story",
    fields: [
      { key: "storyText", label: "Story", type: "textarea", required: true, default: "I moved to Bristol knowing literally nobody. Spent two weeks eating alone. Then I found this group on Meetup. First event I almost didn't go. But I did. Best decision ever." },
    ],
  },

  PhotoDump: {
    component: PhotoDump,
    platforms: { tiktok: TK(450), "instagram-posts": IN(450) },
    engagementTier: "medium",
    bestFor: ["photo-dump", "highlights", "visual-showcase", "dump", "photos"],
    needsPhotos: true,
    desc: "Casual photo collection showcase",
    fields: [
      { key: "title", label: "Title", type: "text", default: "This week's photo dump" },
      { key: "photos", label: "Photo Paths", type: "array", default: [] },
      { key: "ctaText", label: "CTA", type: "text", default: "Join the adventure" },
    ],
  },

  TransitionReveal: {
    component: TransitionReveal,
    platforms: { tiktok: TK(420), "instagram-stories": ST(300) },
    engagementTier: "high",
    bestFor: ["reveal", "surprise", "transition", "hook", "dramatic", "twist"],
    needsPhotos: false,
    desc: "Hook text with dramatic reveal transition",
    fields: [
      { key: "hookText", label: "Hook", type: "text", default: "What if we told you..." },
      { key: "revealText", label: "Reveal", type: "text", default: "2,900+ people found their crew here" },
    ],
  },

  QuizPoll: {
    component: QuizPoll,
    platforms: { tiktok: TK(420), "instagram-stories": ST(300) },
    engagementTier: "high",
    bestFor: ["quiz", "poll", "engagement", "comment-bait", "interactive", "question", "vote"],
    needsPhotos: false,
    desc: "Interactive quiz/poll with answer reveal",
    fields: [
      { key: "question", label: "Question", type: "text", default: "Which event should we run next?" },
      { key: "options", label: "Options", type: "array", default: ["Sunset hike", "Board game night", "Speed friending", "Beach day trip"] },
      { key: "revealIndex", label: "Reveal Answer (0-based)", type: "number", default: 2 },
      { key: "revealLabel", label: "Reveal Label", type: "text", default: "You chose..." },
      { key: "ctaText", label: "CTA", type: "text", default: "Comment below!" },
    ],
  },

  MemberMilestone: {
    component: MemberMilestone,
    platforms: { tiktok: TK(420), "instagram-stories": ST(300) },
    engagementTier: "medium",
    bestFor: ["milestone", "celebration", "growth", "community", "achievement", "members"],
    needsPhotos: false,
    desc: "Milestone celebration with counter",
    fields: [
      { key: "milestone", label: "Number", type: "number", default: 3000 },
      { key: "suffix", label: "Suffix", type: "text", default: "" },
      { key: "preText", label: "Pre Text", type: "text", default: "We just hit..." },
      { key: "celebrationText", label: "Celebration", type: "text", default: "members strong!" },
      { key: "thankYouText", label: "Thank You", type: "text", default: "Thank you for being part of this" },
    ],
  },

  WeeklyRecap: {
    component: WeeklyRecap,
    platforms: { tiktok: TK(450), "instagram-stories": ST(300) },
    engagementTier: "medium",
    bestFor: ["recap", "weekly", "summary", "highlights", "review", "week"],
    needsPhotos: true,
    desc: "Weekly event roundup with attendee counts",
    fields: [
      { key: "weekLabel", label: "Week Label", type: "text", default: "This week at The Super Socializers" },
      { key: "events", label: "Events", type: "events", default: [{ name: "Clifton Suspension Bridge Walk", attendees: 18 }, { name: "Speed Friending @ The Grain Barge", attendees: 24 }, { name: "Board Games Night", attendees: 12 }] },
      { key: "totalAttendees", label: "Total Attendees", type: "number", default: 54 },
      { key: "ctaText", label: "CTA", type: "text", default: "Next week could be your first" },
    ],
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
export function getAvailableComps(platform: Platform) {
  return Object.entries(REGISTRY)
    .filter(([_, entry]) => platform in entry.platforms)
    .map(([name, entry]) => ({ name, ...entry }));
}

export function getCompId(baseName: string, platform: Platform) {
  const entry = REGISTRY[baseName];
  if (!entry || !(platform in entry.platforms)) return null;
  return `${baseName}-${entry.platforms[platform].suffix}`;
}

export function getPlatformConfig(baseName: string, platform: Platform) {
  return REGISTRY[baseName]?.platforms[platform] ?? null;
}

const ENGAGEMENT_W: Record<string, number> = { high: 3, medium: 2, standard: 1 };

export function rankCompositions(intent: string, platform: Platform) {
  const words = intent.toLowerCase().split(/[\s,;.!?]+/).filter(Boolean);
  const results: Array<{ baseName: string; id: string; score: number; entry: CompositionEntry }> = [];

  for (const [name, entry] of Object.entries(REGISTRY)) {
    if (!(platform in entry.platforms)) continue;
    let score = 0;
    const keyMatch = entry.bestFor.filter((t) => words.some((w) => w.includes(t) || t.includes(w))).length;
    score += keyMatch * 10;
    const subMatch = entry.bestFor.filter((t) => intent.toLowerCase().includes(t)).length;
    score += subMatch * 5;
    score += ENGAGEMENT_W[entry.engagementTier] || 1;
    if (score > 0) {
      results.push({ baseName: name, id: `${name}-${entry.platforms[platform].suffix}`, score, entry });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}
