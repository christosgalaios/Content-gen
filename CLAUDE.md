# Socialise Content Generator

This is a **Remotion** project for generating social media video content for **The Super Socializers** (future rebrand: **Socialise.**).

## Tech Stack

- **Remotion** — React-based programmatic video framework
- **TailwindCSS** — Styling via `@remotion/tailwind`
- **Zod** — Schema validation for composition props
- **TypeScript** + **React**

## Commands

```bash
npm run dev        # Open Remotion Studio (preview + edit)
npm run render     # Render a composition to MP4
npx remotion render <CompositionId> out/<filename>.mp4

# Autopilot pipeline
npm run pipeline            # Run full pipeline (ingest → trends → plan → build → render)
npm run pipeline:ingest     # Stage 1: Index content assets
npm run pipeline:trends     # Stage 2: Scrape trending topics
npm run pipeline:plan       # Stage 3: AI-plan video content
npm run pipeline:build      # Stage 4: Build Remotion props
npm run pipeline:render     # Stage 5: Batch render videos
npm run pipeline:dry-run    # Plan without rendering
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
  builder/           # Props generation + validation
  ingest/            # Asset scanning, metadata extraction, tagging
  renderer/          # Batch rendering + caption generation
  trends/            # TikTok Creative Center + Claude trend scraping
  db/                # SQLite database (better-sqlite3)
  utils/             # Logger, Claude CLI client, ffprobe
types/
  pipeline.ts        # Pipeline config + stage types
  content.ts         # Media item types
  plan.ts            # Content plan types
  trends.ts          # Trend data types
public/
  assets/            # Event photos for compositions
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

Compositions are organized in folders in `src/Root.tsx`:

- **TikTok-Reels/** — `EventPromo-TikTok`, `Testimonial-TikTok`, `HookReel-TikTok`, `TextAnimation-TikTok`, `CountdownEvent-TikTok`, `StatsShowcase-TikTok`, `BeforeAfter-TikTok`, `POVReveal-TikTok`, `ListCountdown-TikTok`, `StoryTime-TikTok`, `TransitionReveal-TikTok`, `PhotoDump-TikTok`, `QuizPoll-TikTok`, `MemberMilestone-TikTok`, `WeeklyRecap-TikTok`
- **Instagram-Posts/** — `EventPromo-Insta`, `PhotoMontage-Insta`, `StatsShowcase-Insta`, `PhotoDump-Insta`
- **Instagram-Stories/** — `EventPromo-Story`, `Testimonial-Story`, `CountdownEvent-Story`

Each composition has a Zod schema for its props, making them fully parameterizable.

---

## Brand Context

### About

**The Super Socializers** — Bristol, Bath, Cardiff & Somerset's Friendliest Social Community.
- ~2,900 Meetup members, 4.8/5 rating
- Founded January 2023 by Ben (+ 13 organisers)
- Future rebrand to **Socialise.** with companion app: https://github.com/christosgalaios/SocialiseApp

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
3. **Hook in first 2 seconds** — text or visual that stops the scroll
4. **End with CTA** — always include a call to action
5. **Use brand colors** — orange/blue/dark theme from tailwind config
6. **Safe zones** — keep important content within center 90% (TikTok UI covers edges)
7. **Text must be large** — minimum 48px equivalent for mobile readability
8. **Animate with purpose** — use `useCurrentFrame()` and `interpolate()` for smooth motion
9. **Include captions/text** — most social video is watched on mute

## Rendering

```bash
# Render a specific composition
npx remotion render EventPromo-TikTok out/event-promo.mp4

# Render with custom props
npx remotion render EventPromo-TikTok out/event-promo.mp4 --props='{"eventName":"Saturday Hike","eventDate":"March 8th"}'

# Render as still image (for Instagram posts)
npx remotion still EventPromo-Insta out/event-promo.png
```
