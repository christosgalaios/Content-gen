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
import { GradientOverlay } from "../components/GradientOverlay";
import { FlashTransition } from "../components/FlashTransition";
import { COLORS, FONT_SIZES, SAFE_ZONE } from "../lib/constants";
import { FONTS } from "../lib/fonts";
import { kenBurns, pulseScale } from "../lib/effects";
import { sec, buildAdaptiveScenes } from "../lib/timing";
import { snappyOut } from "../lib/easing";

export const TestimonialSchema = z.object({
  durationInSeconds: z.number().optional(),
  quote: z.string(),
  name: z.string(),
  memberSince: z.string().optional(),
  backgroundImage: z.string().optional(),
});

type Props = z.infer<typeof TestimonialSchema>;

export const Testimonial: React.FC<Props> = ({
  quote,
  name,
  memberSince,
  backgroundImage,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();

  const bgSrc = backgroundImage || staticFile("assets/group-walk-1.jpg");

  // Scenes: intro (1.5s) → quote (5s) → attribution + CTA (3.5s)
  const scenes = buildAdaptiveScenes([sec(1.5), sec(5), sec(3.5)], durationInFrames);
  const [introScene, quoteScene, ctaScene] = scenes;

  const bgTransform = kenBurns(frame, {
    startFrame: 0,
    duration: durationInFrames,
    startScale: 1.0,
    endScale: 1.2,
    direction: "top-right",
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
        <GradientOverlay direction="full" opacity={0.6} />
        <GradientOverlay direction="bottom" opacity={0.7} />
      </AbsoluteFill>

      {/* Scene 1: Intro — quote mark reveal */}
      <Sequence from={introScene.start} durationInFrames={introScene.duration}>
        <QuoteMark />
      </Sequence>

      {/* Scene 2: Quote text */}
      <Sequence from={quoteScene.start} durationInFrames={quoteScene.duration}>
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: `${SAFE_ZONE.top}px ${SAFE_ZONE.horizontal + 20}px ${SAFE_ZONE.bottom}px`,
          }}
        >
          <AnimatedText
            text={`"${quote}"`}
            mode="wordByWord"
            delay={2}
            fontSize={FONT_SIZES.body}
            fontWeight={700}
            color={COLORS.white}
            textShadow
            lineHeight={1.4}
            maxWidth={950}
          />
        </AbsoluteFill>
      </Sequence>

      {/* Scene 3: Name + CTA */}
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
          {/* Name */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <NameLine name={name} memberSince={memberSince} />
          </div>

          <div style={{ height: 40 }} />

          <AnimatedText
            text="Your next adventure starts here"
            mode="fadeUp"
            delay={20}
            fontSize={FONT_SIZES.caption}
            fontWeight={700}
            color={COLORS.primary}
            textShadow
          />
          <AnimatedText
            text="Link in bio"
            mode="fadeUp"
            delay={30}
            fontSize={FONT_SIZES.small}
            fontWeight={700}
            color={COLORS.accent}
            textShadow
          />
        </AbsoluteFill>
      </Sequence>

      <FlashTransition triggerFrame={introScene.end - 2} />
      <FlashTransition triggerFrame={quoteScene.end - 2} />
    </AbsoluteFill>
  );
};

const QuoteMark: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame,
    fps,
    config: { damping: 10, mass: 1, stiffness: 150 },
  });

  const opacity = interpolate(frame, [0, 8], [0, 0.3], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <span
        style={{
          fontFamily: "Georgia, serif",
          fontSize: 400,
          fontWeight: 900,
          color: COLORS.primary,
          opacity,
          transform: `scale(${scale})`,
          lineHeight: 1,
          userSelect: "none",
        }}
      >
        {"\u201C"}
      </span>
    </AbsoluteFill>
  );
};

const NameLine: React.FC<{ name: string; memberSince?: string }> = ({
  name,
  memberSince,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const f = frame - 6;
  if (f < 0) return null;

  const progress = interpolate(f, [0, 10], [0, 1], {
    extrapolateRight: "clamp",
    easing: snappyOut,
  });

  const lineWidth = interpolate(progress, [0, 1], [0, 120]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
        opacity: progress,
      }}
    >
      <div
        style={{
          width: lineWidth,
          height: 3,
          backgroundColor: COLORS.primary,
          borderRadius: 2,
        }}
      />
      <span
        style={{
          fontFamily: FONTS.display,
          fontSize: FONT_SIZES.caption,
          fontWeight: 800,
          color: COLORS.white,
          textShadow: "0 2px 4px rgba(0,0,0,0.8)",
        }}
      >
        — {name}
        {memberSince && (
          <span style={{ color: COLORS.accent, fontWeight: 700 }}>
            {" "}· member since {memberSince}
          </span>
        )}
      </span>
    </div>
  );
};
