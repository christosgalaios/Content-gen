import React from "react";
import {
  AbsoluteFill,
  Sequence,
  Img,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
  staticFile,
} from "remotion";
import { z } from "zod";
import { AnimatedText } from "../components/AnimatedText";
import { PhotoScene } from "../components/PhotoScene";
import { FlashTransition } from "../components/FlashTransition";
import { COLORS, FONT_SIZES, SAFE_ZONE } from "../lib/constants";
import { FONTS } from "../lib/fonts";
import { sec, buildScenes } from "../lib/timing";

export const WeeklyRecapSchema = z.object({
  weekLabel: z.string().default("This week at The Super Socializers"),
  events: z.array(z.object({
    name: z.string(),
    photo: z.string().optional(),
    attendees: z.number().optional(),
  })).default([
    { name: "Clifton Suspension Bridge Walk", attendees: 18 },
    { name: "Speed Friending @ The Grain Barge", attendees: 24 },
    { name: "Board Games Night", attendees: 12 },
  ]),
  totalAttendees: z.number().default(54),
  ctaText: z.string().default("Next week could be your first"),
});

type Props = z.infer<typeof WeeklyRecapSchema>;

export const WeeklyRecap: React.FC<Props> = ({
  weekLabel,
  events,
  totalAttendees,
  ctaText,
}) => {
  const hookDur = sec(2.5);
  const eventDur = sec(2.5);
  const totalEventsDur = events.length * eventDur;
  const statsDur = sec(3);
  const ctaDur = sec(3.5);

  const scenes = buildScenes([hookDur, totalEventsDur, statsDur, ctaDur]);
  const [hookScene, eventsScene, statsScene, ctaScene] = scenes;

  // Default photos to cycle through
  const defaultPhotos = [
    staticFile("assets/group-walk-1.jpg"),
    staticFile("assets/group-outdoor-1.jpg"),
    staticFile("assets/group-activity-1.jpg"),
    staticFile("assets/hike-1.jpg"),
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.dark }}>
      {/* Scene 1: Week title */}
      <Sequence from={hookScene.start} durationInFrames={hookScene.duration}>
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: `${SAFE_ZONE.top}px ${SAFE_ZONE.horizontal}px ${SAFE_ZONE.bottom}px`,
            gap: 20,
          }}
        >
          <WeekBadge />
          <AnimatedText
            text={weekLabel}
            mode="scaleIn"
            delay={8}
            fontSize={FONT_SIZES.headline}
            fontWeight={900}
            color={COLORS.white}
            textShadow
          />
        </AbsoluteFill>
      </Sequence>

      {/* Scene 2: Individual events */}
      {events.map((event, i) => {
        const eventStart = eventsScene.start + i * eventDur;
        const photoSrc = event.photo
          ? staticFile(event.photo)
          : defaultPhotos[i % defaultPhotos.length];

        return (
          <Sequence key={i} from={eventStart} durationInFrames={eventDur}>
            <PhotoScene
              src={photoSrc}
              kenBurnsDirection={
                (["top-left", "top-right", "bottom-left", "center"] as const)[i % 4]
              }
              shakeOnEntry
              overlayOpacity={0.45}
            >
              <EventCard
                name={event.name}
                attendees={event.attendees}
                index={i + 1}
                total={events.length}
              />
            </PhotoScene>
          </Sequence>
        );
      })}

      {/* Scene 3: Total stats */}
      <Sequence from={statsScene.start} durationInFrames={statsScene.duration}>
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: `${SAFE_ZONE.top}px ${SAFE_ZONE.horizontal}px ${SAFE_ZONE.bottom}px`,
            gap: 24,
          }}
        >
          <AnimatedText
            text={`${events.length} events`}
            mode="scaleIn"
            delay={4}
            fontSize={FONT_SIZES.headline}
            fontWeight={900}
            color={COLORS.accent}
            textShadow
          />
          <AnimatedText
            text={`${totalAttendees} people showed up`}
            mode="fadeUp"
            delay={14}
            fontSize={FONT_SIZES.body}
            fontWeight={800}
            color={COLORS.white}
            textShadow
          />
          <AnimatedText
            text="90% came alone"
            mode="fadeUp"
            delay={24}
            fontSize={FONT_SIZES.caption}
            fontWeight={800}
            color={COLORS.primary}
            textShadow
          />
        </AbsoluteFill>
      </Sequence>

      {/* Scene 4: CTA */}
      <Sequence from={ctaScene.start} durationInFrames={ctaScene.duration}>
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: `${SAFE_ZONE.top}px ${SAFE_ZONE.horizontal}px ${SAFE_ZONE.bottom}px`,
            gap: 30,
          }}
        >
          <AnimatedText
            text={ctaText}
            mode="scaleIn"
            delay={4}
            fontSize={FONT_SIZES.headline}
            fontWeight={900}
            color={COLORS.white}
            textShadow
          />
          <AnimatedText
            text="Join 2,900+ members on Meetup"
            mode="fadeUp"
            delay={16}
            fontSize={FONT_SIZES.caption}
            fontWeight={800}
            color={COLORS.primary}
            textShadow
          />
          <AnimatedText
            text="Link in bio"
            mode="fadeUp"
            delay={24}
            fontSize={FONT_SIZES.small}
            fontWeight={700}
            color={COLORS.accent}
            textShadow
          />
        </AbsoluteFill>
      </Sequence>

      {/* Transitions */}
      <FlashTransition triggerFrame={hookScene.end - 2} color={COLORS.primary} />
      {events.map((_, i) => (
        <FlashTransition
          key={i}
          triggerFrame={eventsScene.start + (i + 1) * eventDur - 2}
          peakOpacity={0.5}
        />
      ))}
      <FlashTransition triggerFrame={statsScene.end - 2} />
    </AbsoluteFill>
  );
};

/** "THIS WEEK" badge */
const WeekBadge: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame,
    fps,
    config: { damping: 10, mass: 0.5, stiffness: 200 },
    delay: 2,
  });

  return (
    <div
      style={{
        backgroundColor: COLORS.primary,
        padding: "12px 36px",
        borderRadius: 40,
        transform: `scale(${scale})`,
      }}
    >
      <span
        style={{
          fontFamily: FONTS.display,
          fontSize: FONT_SIZES.small,
          fontWeight: 900,
          color: COLORS.white,
          letterSpacing: 4,
        }}
      >
        THIS WEEK
      </span>
    </div>
  );
};

/** Event card overlay */
const EventCard: React.FC<{
  name: string;
  attendees?: number;
  index: number;
  total: number;
}> = ({ name, attendees, index, total }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const slideUp = interpolate(frame, [0, 12], [60, 0], {
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(frame, [0, 8], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: SAFE_ZONE.bottom + 40,
        left: SAFE_ZONE.horizontal,
        right: SAFE_ZONE.horizontal,
        transform: `translateY(${slideUp}px)`,
        opacity,
      }}
    >
      {/* Counter badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            backgroundColor: COLORS.primary,
            width: 48,
            height: 48,
            borderRadius: 24,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontFamily: FONTS.display,
              fontSize: 28,
              fontWeight: 900,
              color: COLORS.white,
            }}
          >
            {index}/{total}
          </span>
        </div>
      </div>

      {/* Event name */}
      <div
        style={{
          backgroundColor: "rgba(0,0,0,0.7)",
          borderRadius: 16,
          padding: "20px 28px",
          borderLeft: `4px solid ${COLORS.primary}`,
        }}
      >
        <div
          style={{
            fontFamily: FONTS.display,
            fontSize: FONT_SIZES.body,
            fontWeight: 900,
            color: COLORS.white,
            marginBottom: attendees ? 8 : 0,
          }}
        >
          {name}
        </div>
        {attendees && (
          <div
            style={{
              fontFamily: FONTS.display,
              fontSize: FONT_SIZES.small,
              fontWeight: 700,
              color: COLORS.accent,
            }}
          >
            {attendees} people showed up
          </div>
        )}
      </div>
    </div>
  );
};
