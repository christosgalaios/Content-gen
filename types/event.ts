export type EventType =
  | "hiking"
  | "pub-social"
  | "games"
  | "speed-friending"
  | "comedy"
  | "festival"
  | "walk"
  | "coffee-social"
  | "activity"
  | "mixed"
  | "other";

export interface MeetupEvent {
  meetupId: string;
  title: string;
  description: string;
  dateTime: string; // ISO datetime
  endTime: string | null;
  location: string; // venue + city
  city: string;
  eventType: EventType;
  capacity: number | null;
  attendees: number;
  imageUrl: string | null;
  meetupUrl: string;
  scrapedAt: string;
}

/** Mapping from event type keywords to EventType */
export const EVENT_TYPE_KEYWORDS: Record<string, EventType> = {
  hike: "hiking",
  hiking: "hiking",
  walk: "walk",
  "night walk": "walk",
  "speed friending": "speed-friending",
  "speed friend": "speed-friending",
  comedy: "comedy",
  "comedy night": "comedy",
  cocktail: "pub-social",
  pub: "pub-social",
  drinks: "pub-social",
  bar: "pub-social",
  "frog & newt": "walk",
  coffee: "coffee-social",
  chinwag: "coffee-social",
  game: "games",
  games: "games",
  quiz: "games",
  detective: "games",
  bowling: "games",
  "lane7": "games",
  festival: "festival",
  holi: "festival",
  socialise: "pub-social",
  "girls meetup": "pub-social",
  meetup: "mixed",
};
