import React from "react";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  Img,
  staticFile,
  interpolate,
  spring,
} from "remotion";
import { z } from "zod";
import { AnimatedText } from "../components/AnimatedText";
import { NumberCounter } from "../components/NumberCounter";
import { Badge } from "../components/Badge";
import { GradientOverlay } from "../components/GradientOverlay";
import { FlashTransition } from "../components/FlashTransition";
import { COLORS, FONT_SIZES, SAFE_ZONE } from "../lib/constants";
import { FONTS } from "../lib/fonts";
import { kenBurns, pulseScale, staggerDelay } from "../lib/effects";
import { sec, buildAdaptiveScenes } from "../lib/timing";
import { snappyOut } from "../lib/easing";

export const CountdownEventSchema = z.object({
  durationInSeconds: z.number().optional(),
  eventName: z.string(),
  daysLeft: z.number().default(3),
  spotsLeft: z.number().optional(),
  eventType: z.string().default("Social"),
  highlights: z.array(z.string()).default([]),
  backgroundImage: z.string().optional(),
});

type Props = z.infer<typeof CountdownEventSchema>;

export const CountdownEvent: React.FC<Props> = ({
  eventName,
  daysLeft,
  spotsLeft,
  eventType,
  highlights,
  backgroundImage,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const bgSrc = backgroundImage || staticFile("assets/hike-1.jpg");

  // Scenes: countdown (4s) → event name (3s) → highlights (4s) → CTA (4s)
  const hasHighlights = highlights.length > 0;
  const scenes = hasHighlights
    ? buildAdaptiveScenes([sec(4), sec(3), sec(4), sec(4)], durationInFrames)
    : buildAdaptiveScenes([sec(4), sec(4), sec(7)], durationInFrames);

  const bgTransform = kenBurns(frame, {
    startFrame: 0,
    duration: durationInFrames,
    startScale: 1.0,
    endScale: 1.2,
    direction: "bottom-left",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.dark }}>
      {/* Background */}
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <Img
          src={bgSrc}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: bgTransform,
          }}
        />
        <GradientOverlay direction="full" opacity={0.65} />
      </AbsoluteFill>

      {/* Scene 1: Countdown number */}
      <Sequence from={scenes[0].start} durationInFrames={scenes[0].duration}>
        <CountdownSlide daysLeft={daysLeft} />
      </Sequence>

      {/* Scene 2: Event name */}
      <Sequence from={scenes[1].start} durationInFrames={scenes[1].duration}>
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
          <Badge text={eventType} delay={2} />
          <div style={{ marginTop: 20 }}>
            <AnimatedText
              text={eventName}
              mode="scaleIn"
              delay={8}
              fontSize={FONT_SIZES.hookTitle}
              fontWeight={900}
              color={COLORS.white}
              textShadow
            />
          </div>
          {spotsLeft !== undefined && (
            <div style={{ marginTop: 20 }}>
              <AnimatedText
                text={`Only ${spotsLeft} spots left!`}
                mode="fadeUp"
                delay={20}
                fontSize={FONT_SIZES.caption}
                fontWeight={700}
                color={COLORS.accent}
                textShadow
              />
            </div>
          )}
        </AbsoluteFill>
      </Sequence>

      {/* Scene 3: Highlights (if any) or CTA */}
      {hasHighlights ? (
        <>
          <Sequence from={scenes[2].start} durationInFrames={scenes[2].duration}>
            <HighlightsList highlights={highlights} />
          </Sequence>
          <Sequence from={scenes[3].start} durationInFrames={scenes[3].duration}>
            <CTASlide />
          </Sequence>
          <FlashTransition triggerFrame={scenes[2].end - 2} />
        </>
      ) : (
        <Sequence from={scenes[2].start} durationInFrames={scenes[2].duration}>
          <CTASlide />
        </Sequence>
      )}

      {/* Transitions */}
      <FlashTransition triggerFrame={scenes[0].end - 2} color={COLORS.primary} peakOpacity={0.5} />
      <FlashTransition triggerFrame={scenes[1].end - 2} />
    </AbsoluteFill>
  );
};

const CountdownSlide: React.FC<{ daysLeft: number }> = ({ daysLeft }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
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
      <AnimatedText
        text="HAPPENING IN"
        mode="fadeUp"
        delay={2}
        fontSize={FONT_SIZES.caption}
        fontWeight={800}
        color={COLORS.accent}
        textShadow
      />
      <NumberCounter
        from={daysLeft + 10}
        to={daysLeft}
        delay={8}
        duration={40}
        fontSize={200}
        color={COLORS.primary}
      />
      <AnimatedText
        text={daysLeft === 1 ? "DAY" : "DAYS"}
        mode="fadeUp"
        delay={12}
        fontSize={FONT_SIZES.headline}
        fontWeight={900}
        color={COLORS.white}
        textShadow
      />
    </AbsoluteFill>
  );
};

const HighlightsList: React.FC<{ highlights: string[] }> = ({ highlights }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: `${SAFE_ZONE.top}px ${SAFE_ZONE.horizontal + 40}px ${SAFE_ZONE.bottom}px`,
        gap: 40,
      }}
    >
      {highlights.map((h, i) => {
        const delay = staggerDelay(i, { baseDelay: 4, stagger: sec(1) });
        const f = frame - delay;
        if (f < 0) return <div key={i} style={{ height: 60, opacity: 0 }} />;

        const progress = interpolate(f, [0, 10], [0, 1], {
          extrapolateRight: "clamp",
          easing: snappyOut,
        });

        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 24,
              opacity: progress,
              transform: `translateX(${interpolate(progress, [0, 1], [40, 0])}px)`,
            }}
          >
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                backgroundColor: COLORS.primary,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: FONTS.display,
                fontSize: FONT_SIZES.caption,
                fontWeight: 700,
                color: COLORS.white,
                textShadow: "1px 1px 0 rgba(0,0,0,0.8)",
              }}
            >
              {h}
            </span>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const CTASlide: React.FC = () => {
  const frame = useCurrentFrame();

  const scale = frame > 20
    ? pulseScale(frame, { startFrame: 20, pulseAmount: 0.025, speed: 3 })
    : 1;

  return (
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
        text="Don't miss out"
        mode="bounce"
        delay={4}
        fontSize={FONT_SIZES.headline}
        fontWeight={900}
        color={COLORS.white}
        textShadow
      />
      <div style={{ transform: `scale(${scale})`, marginTop: 20 }}>
        <AnimatedText
          text="Come alone. Leave with friends."
          mode="fadeUp"
          delay={16}
          fontSize={FONT_SIZES.body}
          fontWeight={800}
          color={COLORS.primary}
          textShadow
        />
      </div>
      <AnimatedText
        text="Link in bio"
        mode="fadeUp"
        delay={26}
        fontSize={FONT_SIZES.small}
        fontWeight={700}
        color={COLORS.accent}
        textShadow
      />
    </AbsoluteFill>
  );
};
