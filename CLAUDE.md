> **IMPORTANT — Cross-project rules apply.** Read `~/.claude/claude-shared/CLAUDE.md` before starting work. If that file doesn't exist, run: `git clone https://github.com/christosgalaios/claude-shared.git ~/.claude/claude-shared`

# Socialise Content Generator

This is a **Remotion** project for generating social media video content for **The Super Socializers** (future rebrand: **Socialise.**).

## Tech Stack

- **Remotion** — React-based programmatic video framework
- **TailwindCSS** — Styling via `@remotion/tailwind`
- **Zod** — Schema validation for composition props
- **TypeScript** + **React**
- **better-sqlite3** — Pipeline state / render tracking
- **Claude CLI** — AI content planning via `claude --print`

## Commands

```bash
npm run dev        # Open Remotion Studio (preview + edit)
npm run render     # Render a composition to MP4
npm run dashboard  # Open local dashboard at http://localhost:3333
npx remotion render <CompositionId> out/<filename>.mp4

# Autopilot pipeline (generic batch)
npm run pipeline            # Run full pipeline (ingest → trends → plan → build → render)
npm run pipeline:ingest     # Stage 1: Index content assets
npm run pipeline:trends     # Stage 2: Scrape trending topics
npm run pipeline:plan       # Stage 3: AI-plan video content
npm run pipeline:build      # Stage 4: Build Remotion props
npm run pipeline:render     # Stage 5: Batch render videos
npm run pipeline:dry-run    # Plan without rendering

# Event-driven pipeline (per-event promotional batches)
npm run pipeline:events           # Full event pipeline (scrape → trends → plan → build → render)
npm run pipeline:events:scrape    # Scrape upcoming Meetup events only
npm run pipeline:events:plan      # Generate per-event content plans only
npm run pipeline:events:dry-run   # Plan without rendering

# TikTok Studio
npm run pipeline:tiktok-login    # Log in to TikTok Studio (saves cookies for analytics)
```

## Project Structure

```
src/
  index.ts           # Entry point (registerRoot)
  Root.tsx            # All compositions + Zod schemas
  styles.css          # TailwindCSS entry
  compositions/       # Individual composition components (expand here)
  components/         # Shared UI components (text overlays, CTAs, etc.)
  lib/                # Utilities (easing, timing helpers)
pipeline/
  index.ts           # Pipeline CLI entry point
  config.ts          # Pipeline configuration loader
  brain/             # AI planning (composition picker, planner, prompts)
    composition-picker.ts  # Scored ranking, variety enforcement, batch diversity
    planner.ts             # Claude-powered content plan generation (generic batches)
    event-planner.ts       # Event-driven planning (per-event promotional batches)
    prompts.ts             # Prompt construction + content/trend/event summarization
  builder/           # Props generation + validation
    schema-validator.ts    # Runtime prop validation against composition schemas
  dashboard/         # Local dashboard server + static HTML
    server.ts              # Lightweight HTTP server on port 3333
    public/index.html      # Local dashboard with API-backed features
  ingest/            # Asset scanning, metadata extraction, tagging
  renderer/          # Batch rendering + caption generation
  trends/            # TikTok Studio/Creative Center + Claude trend scraping + Meetup events
    meetup-scraper.ts      # Scrape upcoming events from Meetup
    event-matcher.ts       # Map event types → relevant trends + compositions
    tiktok-creative.ts     # TikTok Studio analytics + Creative Center trends
    claude-trends.ts       # Claude web search for niche trends
    trend-store.ts         # Store/cache trends in SQLite
    matcher.ts             # Match trends to content assets
  db/                # SQLite database (node:sqlite)
  utils/             # Logger, Claude CLI client, ffprobe
types/
  pipeline.ts        # Pipeline config + stage types
  content.ts         # Media item types (ContentItem, MediaMetadata)
  plan.ts            # Content plan types (ContentPlan, ContentPlanItem, Platform)
  trends.ts          # Trend data types (Trend, TrendMatch)
  event.ts           # Meetup event types (MeetupEvent, EventType)
docs/
  index.html         # Static GitHub Pages dashboard (no server needed)
public/
  assets/            # Event photos for compositions
data/
  pipeline.db        # SQLite DB (tracked in git, updated by cloud pipeline)
.github/workflows/
  ci.yml             # TypeScript + Remotion build checks + auto-merge
  cd.yml             # Automated releases on merge to main
  pages.yml          # Deploy docs/ to GitHub Pages on push to main
  scheduled-pipeline.yml  # Daily cron: Meetup + TikTok scraping
remotion.config.ts    # Webpack + TailwindCSS config
tailwind.config.js    # Tailwind theme (brand colors, fonts)
```

## Video Formats

| Platform | Format | Dimensions | Use Case |
|----------|--------|------------|----------|
| TikTok / Reels | 9:16 vertical | 1080×1920 | Short-form video content |
| Instagram Post | 1:1 square | 1080×1080 | Feed posts, carousels |
| Instagram Story | 9:16 vertical | 1080×1920 | Ephemeral stories |

## Available Compositions

Compositions are organized in folders in `src/Root.tsx`. There are 16 base compositions, registered across 3 platforms:

- **TikTok-Reels/** (15) — `EventPromo-TikTok`, `Testimonial-TikTok`, `HookReel-TikTok`, `TextAnimation-TikTok`, `CountdownEvent-TikTok`, `StatsShowcase-TikTok`, `BeforeAfter-TikTok`, `POVReveal-TikTok`, `ListCountdown-TikTok`, `StoryTime-TikTok`, `TransitionReveal-TikTok`, `PhotoDump-TikTok`, `QuizPoll-TikTok`, `MemberMilestone-TikTok`, `WeeklyRecap-TikTok`
- **Instagram-Posts/** (4) — `EventPromo-Insta`, `PhotoMontage-Insta`, `StatsShowcase-Insta`, `PhotoDump-Insta`
- **Instagram-Stories/** (13) — `EventPromo-Story`, `Testimonial-Story`, `CountdownEvent-Story`, `StatsShowcase-Story`, `MemberMilestone-Story`, `WeeklyRecap-Story`, `HookReel-Story`, `BeforeAfter-Story`, `ListCountdown-Story`, `QuizPoll-Story`, `StoryTime-Story`, `TransitionReveal-Story`

### Platform coverage by composition

| Composition | TikTok/Reels | Insta Post | Story | Needs Photos |
|------------|:---:|:---:|:---:|:---:|
| EventPromo | ✓ | ✓ | ✓ | No |
| Testimonial | ✓ | — | ✓ | No |
| HookReel | ✓ | — | ✓ | No |
| TextAnimation | ✓ | — | — | No |
| CountdownEvent | ✓ | — | ✓ | No |
| StatsShowcase | ✓ | ✓ | ✓ | No |
| PhotoMontage | — | ✓ | — | Yes |
| POVReveal | ✓ | — | — | Yes |
| BeforeAfter | ✓ | — | ✓ | No |
| ListCountdown | ✓ | — | ✓ | No |
| StoryTime | ✓ | — | ✓ | No |
| PhotoDump | ✓ | ✓ | — | Yes |
| TransitionReveal | ✓ | — | ✓ | No |
| QuizPoll | ✓ | — | ✓ | No |
| MemberMilestone | ✓ | — | ✓ | No |
| WeeklyRecap | ✓ | — | ✓ | Yes |

### Intentionally excluded variants
- **TextAnimation** has no Story/Post variant — pure kinetic type works best full-screen on TikTok
- **POVReveal** has no Story variant — multi-stage photo reveal is too long for ephemeral stories
- **PhotoMontage** is Instagram Post only — designed for 1:1 grid format
- **PhotoDump** has no Story variant — grid layout doesn't fit the swipe-through story UX

Each composition has a Zod schema for its props, making them fully parameterizable.

---

## Pipeline Intelligence

### Composition Picker (`pipeline/brain/composition-picker.ts`)

The picker uses scored ranking to select compositions:
- **Keyword matching** — intent words matched against each composition's `bestFor` tags
- **Engagement tiers** — compositions tagged `high`/`medium`/`standard` based on expected engagement
- **Variety enforcement** — recently-used compositions are penalized in scoring
- **Batch diversity** — `pickDiverseBatch()` ensures no two consecutive videos use the same composition and balances engagement tiers
- **Photo awareness** — `compositionNeedsPhotos()` flags compositions that require media assets

### Content Planner (`pipeline/brain/planner.ts`)

The planner calls Claude with a structured prompt that includes:
- Content library summary (with least-used assets highlighted for rotation)
- Trend data grouped by category with relevance thresholds
- Content mix targets (40% engagement / 30% social-proof / 30% event-promo)
- CTA and hashtag rotation rules
- Posting cadence guidelines
- Validation: warns on duplicate compositions and missing photo assets

### System Prompt Strategy

The Claude system prompt emphasizes:
- Scroll-stopping hooks (specific, not generic)
- Emotional arcs: hook → tension/value → CTA
- Prioritizing comments and shares over passive views

### Event-Driven Pipeline (`pipeline/brain/event-planner.ts`)

The event pipeline scrapes real upcoming Meetup events and generates targeted promotional batches:

1. **Meetup Scraping** — Playwright extracts events from https://www.meetup.com/the-super-socializers-uk/events/ (title, date, time, location, attendees, capacity)
2. **Event Categorization** — Auto-classifies events as: hiking, pub-social, games, speed-friending, comedy, festival, coffee-social, walk, activity, mixed, other
3. **Trend Matching** — Filters global trends to those relevant to each event type (hiking trends for hiking events, pub trends for pub socials, etc.)
4. **Per-Event Planning** — Calls Claude with event-specific context (date, location, days until event, urgency level, relevant trends) to generate 2-5 promotional videos per event
5. **Posting Schedule** — Claude decides optimal posting times relative to the event date (e.g., 7d, 5d, 3d, 1d before)
6. **Composition Selection** — Each event type has recommended compositions:
   - Hiking: CountdownEvent, POVReveal, BeforeAfter, ListCountdown
   - Pub Social: CountdownEvent, QuizPoll, Testimonial, HookReel
   - Speed Friending: CountdownEvent, QuizPoll, HookReel, BeforeAfter
   - Games: CountdownEvent, QuizPoll, HookReel, ListCountdown

### TikTok Studio Integration

The TikTok trends scraper supports two modes:
- **TikTok Studio** (authenticated) — scrapes account analytics, video performance, and trending content suggestions. Requires `npm run pipeline:tiktok-login` to save session cookies.
- **Creative Center** (public fallback) — scrapes trending hashtags from ads.tiktok.com. No auth required.

Account insights from TikTok Studio inform content strategy by identifying what formats and hooks perform best for our specific audience.

---

## Brand Context

### About

**The Super Socializers** — Bristol, Bath, Cardiff & Somerset's Friendliest Social Community.
- ~2,900 Meetup members, 4.8/5 rating
- Founded January 2023 by Ben (+ 13 organisers)

### Social Accounts

- **TikTok:** https://www.tiktok.com/@supersocializers (16 followers, ~20 videos, 235-919 views/video)
- **Instagram:** https://www.instagram.com/the_super_socializers/
- **Meetup:** https://www.meetup.com/the-super-socializers-uk/

### Brand Voice

- Fun, energetic, warm, inclusive, slightly cheeky
- Think: your most outgoing friend inviting you to something brilliant
- First person plural ("we", "us") — never "the group"
- Address reader as "you"
- Short sentences, punchy openers, lots of line breaks
- Emojis: max 3-4 per post. Never in first line on TikTok.

### Key Messages (use these in every piece of content)

1. **90% come alone** — that's totally normal
2. **Strictly platonic**, zero pressure, zero drama
3. **Something for everyone**: hikes, drinks, games, festivals, speed friending
4. **Bristol's friendliest social community** (nearly 3,000 members)

### Brand Colors (in `tailwind.config.js`)

- Primary: `#FF6B35` (warm orange)
- Secondary: `#004E89` (deep blue)
- Accent: `#F7C948` (golden yellow)
- Dark: `#1A1A2E` (near-black background)
- Light: `#F5F5F5` (off-white)

### CTA Phrases

- "Come alone. Leave with friends."
- "Join 2,900+ members on Meetup"
- "Link in bio"
- "Your next adventure starts here"
- "Comment below!"
- "Tag someone who needs this"

---

## Content Assets

### Drive Content (photos + videos from past events)

Located at: `H:\My Drive\Socialise\Files\Old Promo Content-25-02-26`

Contains ~120 files:
- **Photos**: Event photos from 2023-2024 (hikes, pub socials, outdoor activities, group shots)
- **Videos**: 9 video clips from events (walks, outdoor adventures)
- **Screenshots**: Gallery screenshots from late 2025 / early 2026

To use in Remotion, copy files to `public/` or reference via `staticFile()`.

### Existing Slide Assets

Located at: `C:\Users\xgal\Desktop\Socialise\socialise-content\`
- `slide_1_hook.png` through `slide_5_cta.png` — TikTok slide sequence (1080×1920)
- `Super_Socializers_Content_Pack.docx` — Full content pack with templates

---

## SEO / Hashtag Strategy

### Always-on Hashtags
`#TheSuperSocializers #bristolsocial #meetnewpeoplebristol`

### High-priority (match TikTok search queries)
`#hikingbristol #bristolwalks #bristolhiking #socialcirclesbristol #newtobristol`

### Niche/reach
`#makingfriendsasanadult #adultfriendship #bristolevents #thingstodoinbristol #speedfriending`

### Location rotation
`#bath #cardiff #cardiffevents #cardifflife #weston`

---

## Content Creation Guidelines

When creating new compositions or content:

1. **Always use 30fps** — standard for social media
2. **Keep videos 10-15 seconds** for TikTok (300-450 frames at 30fps)
3. **Stories are shorter** — 10 seconds max (300 frames at 30fps)
4. **Hook in first 2 seconds** — text or visual that stops the scroll
5. **End with CTA** — always include a call to action
6. **Use brand colors** — orange/blue/dark theme from tailwind config
7. **Safe zones** — keep important content within center 90% (TikTok UI covers edges)
8. **Text must be large** — minimum 48px equivalent for mobile readability
9. **Animate with purpose** — use `useCurrentFrame()` and `interpolate()` for smooth motion
10. **Include captions/text** — most social video is watched on mute
11. **Rotate assets** — prefer least-used photos to keep content fresh
12. **Vary compositions** — never repeat the same composition type in a batch

## Rendering

```bash
# Render a specific composition
npx remotion render EventPromo-TikTok out/event-promo.mp4

# Render with custom props
npx remotion render EventPromo-TikTok out/event-promo.mp4 --props='{"eventName":"Saturday Hike","eventDate":"March 8th"}'

# Render as still image (for Instagram posts)
npx remotion still EventPromo-Insta out/event-promo.png
```

---

## Prerequisites

The pipeline requires these system dependencies:
- **Node.js** — v18+ with npm
- **ffmpeg / ffprobe** — on system PATH for media metadata extraction
- **Claude CLI** — installed and authenticated (`claude --print` must work)
- **better-sqlite3** — native module, needs `npm install` to compile

Optional:
- **Playwright** — for TikTok Creative Center trend scraping (`pipeline:trends` stage)
- **Whisper.cpp** — for auto-captioning rendered videos (captions stage)

---

## Dashboard

Two dashboard versions exist:

### GitHub Pages (static)
- **URL**: `https://christosgalaios.github.io/Content-gen/`
- **Source**: `docs/index.html`
- **Deployed by**: `.github/workflows/pages.yml` (on push to main when `docs/` changes)
- **Features**: Composition browser, composition picker (client-side scoring), batch generator, pipeline guide, platform coverage table
- **No server needed** — all composition data + picker logic is embedded in client-side JavaScript

### Local Dashboard (server-backed)
- **URL**: `http://localhost:3333`
- **Run**: `npm run dashboard`
- **Source**: `pipeline/dashboard/server.ts` + `pipeline/dashboard/public/index.html`
- **Extra features**: Live DB stats (content items, trends, renders), recent plans/renders from SQLite

### Keeping dashboards in sync
When adding or modifying compositions in `pipeline/brain/composition-picker.ts`, update the `COMPOSITIONS` array in **both**:
1. `pipeline/brain/composition-picker.ts` (server-side, used by pipeline + local dashboard)
2. `docs/index.html` (client-side copy, used by GitHub Pages dashboard)

---

## CI/CD & Automation

### Workflows (`.github/workflows/`)

| Workflow | Trigger | What it does |
|----------|---------|-------------|
| `ci.yml` | Push to main, PRs | TypeScript typecheck + Remotion composition validation + auto-merge passing PRs |
| `cd.yml` | Push to main | Creates date-tagged GitHub Release |
| `pages.yml` | Push to main (when `docs/` changes) | Deploys static dashboard to GitHub Pages |
| `scheduled-pipeline.yml` | Daily cron (8am UTC) | Scrapes Meetup events + TikTok trends, commits `data/pipeline.db` |

### Cloud ↔ Local Workflow

- **Cloud (GitHub Actions)**: Scrapes Meetup events + TikTok trends daily → commits updated `data/pipeline.db` (no API keys needed, Playwright-only)
- **Local**: `git pull` → `npm run pipeline:local` (Claude plans content) → `npm run pipeline:build` → `npm run pipeline:render`

### Auto-merge
PRs auto-merge when CI passes (typecheck + Remotion build). Branch is auto-deleted after merge.

---

## Learnings & Known Issues

- `contentFolder` in `pipeline/config.ts` uses a Windows absolute path — not portable across OSes. Override via `pipeline.config.json` if running on Linux/Mac.
- Composition IDs follow the pattern `{BaseName}-{TikTok|Insta|Story}`. The schema validator strips the suffix to find the base schema.
- The planner fetches the last 20 completed renders (not 10) to better avoid repetition.
- All compositions share the same underlying React component regardless of platform — only dimensions and duration differ between TikTok and Story variants.
- Instagram Post (1:1) variants need careful consideration — not all vertical compositions translate well to square format. Currently only 4 compositions support it.
