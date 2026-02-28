# Socialise Content Generator

Programmatic social media video generation for **The Super Socializers** using [Remotion](https://www.remotion.dev/). Generates TikTok, Instagram Post, and Instagram Story videos from parameterized React compositions, powered by an AI-driven content pipeline.

## Tech Stack

- **Remotion** — React-based programmatic video framework
- **TailwindCSS** — Styling via `@remotion/tailwind`
- **Zod** — Schema validation for composition props
- **TypeScript** + **React**
- **better-sqlite3** — Pipeline state / render tracking
- **Claude CLI** — AI content planning via `claude --print`

## Prerequisites

- **Node.js** v18+
- **ffmpeg / ffprobe** on system PATH
- **Claude CLI** installed and authenticated (`claude --print` must work)

Optional:
- **Playwright** — for TikTok Creative Center trend scraping
- **Whisper.cpp** — for auto-captioning rendered videos

## Getting Started

```bash
npm install
npm run dev          # Open Remotion Studio on port 3000
```

## Commands

```bash
npm run dev          # Open Remotion Studio (preview + edit)
npm run render       # Render a composition to MP4
npm run dashboard    # Launch web dashboard

# Render specific compositions
npx remotion render EventPromo-TikTok out/event-promo.mp4
npx remotion render EventPromo-TikTok out/event-promo.mp4 --props='{"eventName":"Saturday Hike"}'
npx remotion still EventPromo-Insta out/event-promo.png

# Autopilot pipeline
npm run pipeline              # Full pipeline (ingest -> trends -> plan -> build -> render)
npm run pipeline:ingest       # Stage 1: Index content assets
npm run pipeline:trends       # Stage 2: Scrape trending topics
npm run pipeline:plan         # Stage 3: AI-plan video content
npm run pipeline:build        # Stage 4: Build Remotion props
npm run pipeline:render       # Stage 5: Batch render videos
npm run pipeline:dry-run      # Plan without rendering
```

## Project Structure

```
src/
  index.ts              Entry point (registerRoot)
  Root.tsx               All compositions + Zod schemas
  styles.css             TailwindCSS entry
  compositions/          Individual composition components
  components/            Shared UI components (text overlays, CTAs, etc.)
  lib/                   Utilities (easing, timing helpers)
pipeline/
  index.ts               Pipeline CLI entry point
  config.ts              Pipeline configuration loader
  brain/                 AI planning (composition picker, planner, prompts)
  builder/               Props generation + validation
  ingest/                Asset scanning, metadata extraction, tagging
  renderer/              Batch rendering + caption generation
  trends/                TikTok Creative Center + Claude trend scraping
  db/                    SQLite database (better-sqlite3)
  dashboard/             Web dashboard for testing
  utils/                 Logger, Claude CLI client, ffprobe
types/                   TypeScript type definitions
public/assets/           Event photos for compositions
```

## Video Formats

| Platform         | Aspect Ratio | Dimensions | Duration     |
|------------------|:------------:|:----------:|:------------:|
| TikTok / Reels   | 9:16         | 1080x1920  | 10-15 sec    |
| Instagram Post   | 1:1          | 1080x1080  | —            |
| Instagram Story  | 9:16         | 1080x1920  | up to 10 sec |

## Compositions

16 base compositions registered across 3 platforms (32 variants total):

| Composition       | TikTok | Insta Post | Story | Needs Photos |
|-------------------|:------:|:----------:|:-----:|:------------:|
| EventPromo        | x      | x          | x     |              |
| Testimonial       | x      |            | x     |              |
| HookReel          | x      |            | x     |              |
| TextAnimation     | x      |            |       |              |
| CountdownEvent    | x      |            | x     |              |
| StatsShowcase     | x      | x          | x     |              |
| PhotoMontage      |        | x          |       | x            |
| POVReveal         | x      |            |       | x            |
| BeforeAfter       | x      |            | x     |              |
| ListCountdown     | x      |            | x     |              |
| StoryTime         | x      |            | x     |              |
| PhotoDump         | x      | x          |       | x            |
| TransitionReveal  | x      |            | x     |              |
| QuizPoll          | x      |            | x     |              |
| MemberMilestone   | x      |            | x     |              |
| WeeklyRecap       | x      |            | x     | x            |

Composition IDs follow the pattern `{BaseName}-{TikTok|Insta|Story}`.

## Pipeline

The autopilot pipeline runs 5 stages:

1. **Ingest** — Scan content folder, extract media metadata via ffprobe
2. **Trends** — Scrape TikTok Creative Center for trending topics
3. **Plan** — Claude AI generates a content plan (composition selection, copy, CTAs)
4. **Build** — Generate and validate Remotion props against Zod schemas
5. **Render** — Batch render videos with optional auto-captioning

The **composition picker** uses scored ranking with keyword matching, engagement tiers, variety enforcement, and batch diversity. The **planner** targets a content mix of 40% engagement / 30% social proof / 30% event promo.

## License

ISC
