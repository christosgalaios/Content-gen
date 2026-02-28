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
import { BeforeAfter, BeforeAfterSchema } from "./compositions/BeforeAfter";
import { PhotoDump, PhotoDumpSchema } from "./compositions/PhotoDump";
import { POVReveal, POVRevealSchema } from "./compositions/POVReveal";
import { ListCountdown, ListCountdownSchema } from "./compositions/ListCountdown";
import { StoryTime, StoryTimeSchema } from "./compositions/StoryTime";
import { TransitionReveal, TransitionRevealSchema } from "./compositions/TransitionReveal";
import { QuizPoll, QuizPollSchema } from "./compositions/QuizPoll";
import { MemberMilestone, MemberMilestoneSchema } from "./compositions/MemberMilestone";
import { WeeklyRecap, WeeklyRecapSchema } from "./compositions/WeeklyRecap";

// Re-export schemas for external use
export {
  EventPromoSchema,
  TestimonialSchema,
  HookReelSchema,
  TextAnimationSchema,
  PhotoMontageSchema,
  CountdownEventSchema,
  StatsShowcaseSchema,
  BeforeAfterSchema,
  PhotoDumpSchema,
  POVRevealSchema,
  ListCountdownSchema,
  StoryTimeSchema,
  TransitionRevealSchema,
  QuizPollSchema,
  MemberMilestoneSchema,
  WeeklyRecapSchema,
};

// --- Duration override ---
// When durationInSeconds is set in props, override the default frame count.
const FPS = 30;
const calcDuration = (defaultFrames: number) => ({
  props,
}: {
  props: { durationInSeconds?: number };
}) => ({
  durationInFrames: props.durationInSeconds
    ? Math.round(props.durationInSeconds * FPS)
    : defaultFrames,
});

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
          calculateMetadata={calcDuration(450)}
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
          calculateMetadata={calcDuration(300)}
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
          calculateMetadata={calcDuration(450)}
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
          calculateMetadata={calcDuration(300)}
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
          calculateMetadata={calcDuration(450)}
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
          calculateMetadata={calcDuration(450)}
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
        <Composition
          id="BeforeAfter-TikTok"
          component={BeforeAfter}
          durationInFrames={390}
          fps={30}
          width={1080}
          height={1920}
          schema={BeforeAfterSchema}
          calculateMetadata={calcDuration(390)}
          defaultProps={{
            beforeText: "Before: scrolling alone at midnight",
            afterText: "After: 10 new friends in 4 weeks",
            revealText: "The Super Socializers",
          }}
        />
        <Composition
          id="POVReveal-TikTok"
          component={POVReveal}
          durationInFrames={435}
          fps={30}
          width={1080}
          height={1920}
          schema={POVRevealSchema}
          calculateMetadata={calcDuration(435)}
          defaultProps={{
            hookText: "POV: You just moved to Bristol",
            stages: [
              "Week 1: Eating alone every night",
              "Week 2: Finally show up to a walk",
              "Week 3: Speed friending night",
              "Week 4: 10 new friends, 3 group chats",
            ],
            ctaText: "Come alone. Leave with friends.",
            photos: [],
          }}
        />
        <Composition
          id="ListCountdown-TikTok"
          component={ListCountdown}
          durationInFrames={495}
          fps={30}
          width={1080}
          height={1920}
          schema={ListCountdownSchema}
          calculateMetadata={calcDuration(495)}
          defaultProps={{
            title: "5 reasons to join The Super Socializers",
            items: [
              "90% of people come alone",
              "500+ events hosted since 2023",
              "Hikes, pubs, games, festivals",
              "Strictly platonic, zero drama",
              "Bristol's friendliest community",
            ],
            ctaText: "Your next adventure starts here",
          }}
        />
        <Composition
          id="StoryTime-TikTok"
          component={StoryTime}
          durationInFrames={360}
          fps={30}
          width={1080}
          height={1920}
          schema={StoryTimeSchema}
          calculateMetadata={calcDuration(360)}
          defaultProps={{
            storyText:
              "I moved to Bristol knowing literally nobody. Spent two weeks eating alone. Then I found this group on Meetup. First event I almost didn't go. But I did. Best decision ever.",
          }}
        />
        <Composition
          id="TransitionReveal-TikTok"
          component={TransitionReveal}
          durationInFrames={420}
          fps={30}
          width={1080}
          height={1920}
          schema={TransitionRevealSchema}
          calculateMetadata={calcDuration(420)}
          defaultProps={{
            hookText: "What if we told you...",
            revealText: "2,900+ people found their crew here",
          }}
        />
        <Composition
          id="PhotoDump-TikTok"
          component={PhotoDump}
          durationInFrames={450}
          fps={30}
          width={1080}
          height={1920}
          schema={PhotoDumpSchema}
          calculateMetadata={calcDuration(450)}
          defaultProps={{
            title: "This week's photo dump",
            photos: [],
            ctaText: "Join the adventure",
          }}
        />
        <Composition
          id="QuizPoll-TikTok"
          component={QuizPoll}
          durationInFrames={420}
          fps={30}
          width={1080}
          height={1920}
          schema={QuizPollSchema}
          calculateMetadata={calcDuration(420)}
          defaultProps={{
            question: "Which event should we run next?",
            options: [
              "Sunset hike",
              "Board game night",
              "Speed friending",
              "Beach day trip",
            ],
            revealIndex: 2,
            revealLabel: "You chose...",
            ctaText: "Comment below!",
          }}
        />
        <Composition
          id="MemberMilestone-TikTok"
          component={MemberMilestone}
          durationInFrames={420}
          fps={30}
          width={1080}
          height={1920}
          schema={MemberMilestoneSchema}
          calculateMetadata={calcDuration(420)}
          defaultProps={{
            milestone: 3000,
            suffix: "",
            preText: "We just hit...",
            celebrationText: "members strong!",
            thankYouText: "Thank you for being part of this",
          }}
        />
        <Composition
          id="WeeklyRecap-TikTok"
          component={WeeklyRecap}
          durationInFrames={450}
          fps={30}
          width={1080}
          height={1920}
          schema={WeeklyRecapSchema}
          calculateMetadata={calcDuration(450)}
          defaultProps={{
            weekLabel: "This week at The Super Socializers",
            events: [
              { name: "Clifton Suspension Bridge Walk", attendees: 18 },
              { name: "Speed Friending @ The Grain Barge", attendees: 24 },
              { name: "Board Games Night", attendees: 12 },
            ],
            totalAttendees: 54,
            ctaText: "Next week could be your first",
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
          calculateMetadata={calcDuration(450)}
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
          calculateMetadata={calcDuration(300)}
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
          calculateMetadata={calcDuration(360)}
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
        <Composition
          id="PhotoDump-Insta"
          component={PhotoDump}
          durationInFrames={450}
          fps={30}
          width={1080}
          height={1080}
          schema={PhotoDumpSchema}
          calculateMetadata={calcDuration(450)}
          defaultProps={{
            title: "Weekend highlights",
            photos: [],
            ctaText: "This could be you",
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
          calculateMetadata={calcDuration(300)}
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
          calculateMetadata={calcDuration(300)}
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
          calculateMetadata={calcDuration(300)}
          defaultProps={{
            eventName: "Friday Pub Quiz",
            daysLeft: 2,
            eventType: "Quiz Night",
            highlights: [],
          }}
        />
        <Composition
          id="StatsShowcase-Story"
          component={StatsShowcase}
          durationInFrames={300}
          fps={30}
          width={1080}
          height={1920}
          schema={StatsShowcaseSchema}
          calculateMetadata={calcDuration(300)}
          defaultProps={{
            stats: [
              { value: 2900, suffix: "+", label: "Members" },
              { value: 90, suffix: "%", label: "Come solo" },
              { value: 48, suffix: "/5", label: "Rating" },
            ],
            headline: "The Super Socializers",
            ctaText: "Swipe up to join",
          }}
        />
        <Composition
          id="MemberMilestone-Story"
          component={MemberMilestone}
          durationInFrames={300}
          fps={30}
          width={1080}
          height={1920}
          schema={MemberMilestoneSchema}
          calculateMetadata={calcDuration(300)}
          defaultProps={{
            milestone: 3000,
            suffix: "",
            preText: "We just hit...",
            celebrationText: "members!",
            thankYouText: "Thank you!",
          }}
        />
        <Composition
          id="WeeklyRecap-Story"
          component={WeeklyRecap}
          durationInFrames={300}
          fps={30}
          width={1080}
          height={1920}
          schema={WeeklyRecapSchema}
          calculateMetadata={calcDuration(300)}
          defaultProps={{
            weekLabel: "This week's highlights",
            events: [
              { name: "Saturday Hike", attendees: 15 },
              { name: "Pub Quiz Night", attendees: 20 },
            ],
            totalAttendees: 35,
            ctaText: "Join us next week",
          }}
        />
        <Composition
          id="HookReel-Story"
          component={HookReel}
          durationInFrames={300}
          fps={30}
          width={1080}
          height={1920}
          schema={HookReelSchema}
          calculateMetadata={calcDuration(300)}
          defaultProps={{
            hookText: "POV: You just moved to Bristol",
            bodyLines: [
              "Scrolling for plans every weekend",
              "Found a group on Meetup",
              "Showed up alone",
              "Left with 10 new friends",
            ],
            ctaText: "Swipe up to join",
          }}
        />
        <Composition
          id="BeforeAfter-Story"
          component={BeforeAfter}
          durationInFrames={300}
          fps={30}
          width={1080}
          height={1920}
          schema={BeforeAfterSchema}
          calculateMetadata={calcDuration(300)}
          defaultProps={{
            beforeText: "Before: Netflix every Friday",
            afterText: "After: Plans every weekend",
            revealText: "The Super Socializers",
          }}
        />
        <Composition
          id="ListCountdown-Story"
          component={ListCountdown}
          durationInFrames={300}
          fps={30}
          width={1080}
          height={1920}
          schema={ListCountdownSchema}
          calculateMetadata={calcDuration(300)}
          defaultProps={{
            title: "3 reasons to join this week",
            items: [
              "Speed friending on Friday",
              "Hike on Saturday",
              "Pub quiz on Sunday",
            ],
            ctaText: "Swipe up for details",
          }}
        />
        <Composition
          id="QuizPoll-Story"
          component={QuizPoll}
          durationInFrames={300}
          fps={30}
          width={1080}
          height={1920}
          schema={QuizPollSchema}
          calculateMetadata={calcDuration(300)}
          defaultProps={{
            question: "What should our next event be?",
            options: [
              "Sunset hike",
              "Board game night",
              "Beach day trip",
            ],
            revealIndex: 0,
            revealLabel: "Most voted!",
            ctaText: "DM us your pick",
          }}
        />
        <Composition
          id="StoryTime-Story"
          component={StoryTime}
          durationInFrames={300}
          fps={30}
          width={1080}
          height={1920}
          schema={StoryTimeSchema}
          calculateMetadata={calcDuration(300)}
          defaultProps={{
            storyText:
              "Moved to Bristol two months ago. Knew nobody. Found this group. Now I have weekend plans every single week.",
          }}
        />
        <Composition
          id="TransitionReveal-Story"
          component={TransitionReveal}
          durationInFrames={300}
          fps={30}
          width={1080}
          height={1920}
          schema={TransitionRevealSchema}
          calculateMetadata={calcDuration(300)}
          defaultProps={{
            hookText: "What if we told you...",
            revealText: "2,900+ people found their crew here",
          }}
        />
      </Folder>
    </>
  );
};
