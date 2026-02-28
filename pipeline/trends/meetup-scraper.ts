import { log } from "../utils/logger";
import type { MeetupEvent, EventType } from "../../types/event";
import { EVENT_TYPE_KEYWORDS } from "../../types/event";

const MEETUP_URL =
  "https://www.meetup.com/the-super-socializers-uk/events/";

/**
 * Scrape upcoming events from the Super Socializers Meetup page.
 * Uses Playwright to load the page and extract event data from Apollo state.
 */
export async function scrapeMeetupEvents(): Promise<MeetupEvent[]> {
  let chromium: any;
  try {
    chromium = require("playwright").chromium;
  } catch {
    log.warn(
      "Playwright not installed, skipping Meetup scraping. Run: npx playwright install chromium"
    );
    return [];
  }

  const browser = await chromium.launch({ headless: true });
  const now = new Date().toISOString();

  try {
    const page = await browser.newPage();
    await page.goto(MEETUP_URL, {
      waitUntil: "networkidle",
      timeout: 30_000,
    });

    // Wait for event cards to render
    await page.waitForTimeout(3000);

    // Extract event data from the page
    const rawEvents = await page.evaluate(() => {
      const events: Array<{
        title: string;
        dateTime: string;
        endTime: string | null;
        location: string;
        city: string;
        attendees: number;
        imageUrl: string | null;
        meetupUrl: string;
        description: string;
        capacity: number | null;
      }> = [];

      // Try extracting from Apollo state (embedded GraphQL data)
      const apolloScripts = document.querySelectorAll(
        'script[type="application/json"]'
      );
      for (const script of apolloScripts) {
        try {
          const data = JSON.parse(script.textContent || "");
          if (data?.__APOLLO_STATE__) {
            const state = data.__APOLLO_STATE__;
            for (const key of Object.keys(state)) {
              if (key.startsWith("Event:") && state[key]?.title) {
                const evt = state[key];
                const venueRef = evt.venue?.__ref;
                const venue = venueRef ? state[venueRef] : null;

                events.push({
                  title: evt.title || "",
                  dateTime: evt.dateTime || "",
                  endTime: evt.endTime || null,
                  location: venue
                    ? `${venue.name || ""}, ${venue.city || ""}`.trim()
                    : "",
                  city: venue?.city || "",
                  attendees:
                    evt.going?.totalCount ??
                    evt.rsvps?.totalCount ??
                    0,
                  imageUrl: null,
                  meetupUrl: evt.eventUrl || "",
                  description: evt.description || "",
                  capacity: evt.maxTickets || null,
                });
              }
            }
            break;
          }
        } catch {
          // Not the right script tag
        }
      }

      // Fallback: scrape event cards from DOM if Apollo state isn't available
      if (events.length === 0) {
        const cards = document.querySelectorAll(
          '[id*="event-card"], [data-testid*="event"], a[href*="/events/"]'
        );

        for (const card of cards) {
          const anchor = card.closest("a") || card.querySelector("a");
          const href = anchor?.getAttribute("href") || "";
          if (!href.includes("/events/")) continue;

          const titleEl =
            card.querySelector("h2, h3, [class*='title']") ||
            card.querySelector("span");
          const title = titleEl?.textContent?.trim() || "";
          if (!title) continue;

          // Extract date/time from time elements or aria labels
          const timeEl = card.querySelector("time");
          const dateTime = timeEl?.getAttribute("datetime") || "";

          // Extract location
          const locationText =
            card.querySelector('[class*="venue"], [class*="location"]')
              ?.textContent?.trim() || "";

          // Extract attendee count
          const attendeeText =
            card.querySelector('[class*="attendee"], [class*="going"]')
              ?.textContent?.trim() || "";
          const attendeeMatch = attendeeText.match(/(\d+)/);
          const attendees = attendeeMatch
            ? parseInt(attendeeMatch[1], 10)
            : 0;

          // Extract image
          const img = card.querySelector("img");
          const imageUrl = img?.getAttribute("src") || null;

          events.push({
            title,
            dateTime,
            endTime: null,
            location: locationText,
            city: "",
            attendees,
            imageUrl,
            meetupUrl: href.startsWith("http")
              ? href
              : `https://www.meetup.com${href}`,
            description: "",
            capacity: null,
          });
        }
      }

      return events;
    });

    // Process and categorize events
    const meetupEvents: MeetupEvent[] = rawEvents
      .filter((e: any) => e.title && e.dateTime)
      .map((e: any) => ({
        meetupId: extractMeetupId(e.meetupUrl),
        title: e.title,
        description: e.description || "",
        dateTime: e.dateTime,
        endTime: e.endTime,
        location: e.location,
        city: e.city || extractCity(e.location),
        eventType: categorizeEvent(e.title, e.description),
        capacity: e.capacity,
        attendees: e.attendees,
        imageUrl: e.imageUrl,
        meetupUrl: e.meetupUrl,
        scrapedAt: now,
      }));

    // Filter to upcoming events only (today or later)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = meetupEvents.filter((e) => {
      const eventDate = new Date(e.dateTime);
      return eventDate >= today;
    });

    // Sort by date
    upcoming.sort(
      (a, b) =>
        new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
    );

    log.success(`Scraped ${upcoming.length} upcoming Meetup events`);
    return upcoming;
  } catch (err: any) {
    log.warn(`Meetup scraping error: ${err.message}`);
    return [];
  } finally {
    await browser.close();
  }
}

/**
 * Categorize an event based on title and description keywords.
 */
export function categorizeEvent(
  title: string,
  description: string
): EventType {
  const text = `${title} ${description}`.toLowerCase();

  // Check keywords from most specific to least
  for (const [keyword, type] of Object.entries(EVENT_TYPE_KEYWORDS)) {
    if (text.includes(keyword.toLowerCase())) {
      return type;
    }
  }

  return "other";
}

/**
 * Extract event ID from Meetup URL.
 */
function extractMeetupId(url: string): string {
  const match = url.match(/events\/(\d+)/);
  return match ? match[1] : url;
}

/**
 * Extract city from a location string like "The Crown, Bristol".
 */
function extractCity(location: string): string {
  const cities = ["bristol", "cardiff", "bath", "weston-super-mare", "somerset"];
  const lower = location.toLowerCase();
  for (const city of cities) {
    if (lower.includes(city)) return city.charAt(0).toUpperCase() + city.slice(1);
  }
  return "";
}
