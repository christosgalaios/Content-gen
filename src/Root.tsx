import React from "react";
import { Composition, Folder } from "remotion";
import "./styles.css";

// --- Compositions ---
import { EventPromo, EventPromoSchema } from "./compositions/EventPromo";
import { Testimonial, TestimonialSchema } from "./compositions/Testimonial";
import { HookReel, HookReelSchema } from "./compositions/HookReel";
import { TextAnimation, TextAnimationSchema } from "./compositions/TextAnimation";
import { PhotoMontage, PhotoMontageSchema } from "./compositions/PhotoMontage";
import { CountdownEvent, CountdownEventSchema } from "./compositions/CountdownEvent";
import { StatsShowcase, StatsShowcaseSchema } from "./compositions/StatsShowcase";

// Re-export schemas for external use
export {
  EventPromoSchema,
  TestimonialSchema,
  HookReelSchema,
  TextAnimationSchema,
  PhotoMontageSchema,
  CountdownEventSchema,
  StatsShowcaseSchema,
};

// --- Root ---

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* TikTok / Instagram Reels (9:16) */}
      <Folder name="TikTok-Reels">
        <Composition
          id="EventPromo-TikTok"
          component={EventPromo}
          durationInFrames={450}
          fps={30}
          width={1080}
          height={1920}
          schema={EventPromoSchema}
          defaultProps={{
            eventName: "Saturday Bristol Walk",
            eventDate: "This Saturday",
            eventTime: "11:00 AM",
            eventLocation: "Bristol Harbourside",
            eventType: "Hike",
            memberCount: "2,900+",
          }}
        />
        <Composition
          id="Testimonial-TikTok"
          component={Testimonial}
          durationInFrames={300}
          fps={30}
          width={1080}
          height={1920}
          schema={TestimonialSchema}
          defaultProps={{
            quote: "I moved to Bristol knowing nobody. Found this group and now I have an actual social life!",
            name: "Sarah",
            memberSince: "2023",
          }}
        />
        <Composition
          id="HookReel-TikTok"
          component={HookReel}
          durationInFrames={450}
          fps={30}
          width={1080}
          height={1920}
          schema={HookReelSchema}
          defaultProps={{
            hookText: "POV: You just moved to Bristol",
            bodyLines: [
              "Week 1: Eating alone every night",
              "Week 2: Scrolling Meetup at 2am",
              "Week 3: Finally show up to a walk",
              "Week 4: 10 new friends, 3 group chats",
            ],
            ctaText: "Come alone. Leave with friends.",
          }}
        />
        <Composition
          id="TextAnimation-TikTok"
          component={TextAnimation}
          durationInFrames={300}
          fps={30}
          width={1080}
          height={1920}
          schema={TextAnimationSchema}
          defaultProps={{
            lines: [
              "90% of people come alone",
              "That's totally normal",
              "Zero pressure. Zero drama.",
              "Just good vibes.",
            ],
            backgroundColor: "#1A1A2E",
            textColor: "#FFFFFF",
            accentColor: "#FF6B35",
          }}
        />
        <Composition
          id="CountdownEvent-TikTok"
          component={CountdownEvent}
          durationInFrames={450}
          fps={30}
          width={1080}
          height={1920}
          schema={CountdownEventSchema}
          defaultProps={{
            eventName: "Speed Friending Night",
            daysLeft: 3,
            spotsLeft: 12,
            eventType: "Speed Friending",
            highlights: [
              "Meet 20+ new people",
              "Structured icebreakers",
              "Drinks & good vibes",
            ],
          }}
        />
        <Composition
          id="StatsShowcase-TikTok"
          component={StatsShowcase}
          durationInFrames={450}
          fps={30}
          width={1080}
          height={1920}
          schema={StatsShowcaseSchema}
          defaultProps={{
            stats: [
              { value: 2900, suffix: "+", label: "Members & counting" },
              { value: 90, suffix: "%", label: "Come alone" },
              { value: 500, suffix: "+", label: "Events hosted" },
            ],
            headline: "The Super Socializers",
            ctaText: "Be part of the story",
          }}
        />
      </Folder>

      {/* Instagram Posts (1:1) */}
      <Folder name="Instagram-Posts">
        <Composition
          id="EventPromo-Insta"
          component={EventPromo}
          durationInFrames={450}
          fps={30}
          width={1080}
          height={1080}
          schema={EventPromoSchema}
          defaultProps={{
            eventName: "Speed Friending Night",
            eventDate: "Friday 7th March",
            eventTime: "7:00 PM",
            eventLocation: "The Grain Barge, Bristol",
            eventType: "Speed Friending",
            memberCount: "2,900+",
          }}
        />
        <Composition
          id="PhotoMontage-Insta"
          component={PhotoMontage}
          durationInFrames={300}
          fps={30}
          width={1080}
          height={1080}
          schema={PhotoMontageSchema}
          defaultProps={{
            images: [],
            overlayText: "This could be your weekend",
            ctaText: "Join 2,900+ members on Meetup",
          }}
        />
        <Composition
          id="StatsShowcase-Insta"
          component={StatsShowcase}
          durationInFrames={360}
          fps={30}
          width={1080}
          height={1080}
          schema={StatsShowcaseSchema}
          defaultProps={{
            stats: [
              { value: 2900, suffix: "+", label: "Members" },
              { value: 48, suffix: "/5", label: "Rating" },
              { value: 90, suffix: "%", label: "Come solo" },
            ],
            headline: "By the numbers",
            ctaText: "Join us",
          }}
        />
      </Folder>

      {/* Instagram Stories (9:16) */}
      <Folder name="Instagram-Stories">
        <Composition
          id="EventPromo-Story"
          component={EventPromo}
          durationInFrames={300}
          fps={30}
          width={1080}
          height={1920}
          schema={EventPromoSchema}
          defaultProps={{
            eventName: "Sunday Board Games",
            eventDate: "This Sunday",
            eventTime: "3:00 PM",
            eventLocation: "Chance & Counters, Bristol",
            eventType: "Board Games",
            memberCount: "2,900+",
          }}
        />
        <Composition
          id="Testimonial-Story"
          component={Testimonial}
          durationInFrames={300}
          fps={30}
          width={1080}
          height={1920}
          schema={TestimonialSchema}
          defaultProps={{
            quote: "Best decision I made this year. Met my whole friend group through Super Socializers!",
            name: "James",
            memberSince: "2024",
          }}
        />
        <Composition
          id="CountdownEvent-Story"
          component={CountdownEvent}
          durationInFrames={300}
          fps={30}
          width={1080}
          height={1920}
          schema={CountdownEventSchema}
          defaultProps={{
            eventName: "Friday Pub Quiz",
            daysLeft: 2,
            eventType: "Quiz Night",
            highlights: [],
          }}
        />
      </Folder>
    </>
  );
};
