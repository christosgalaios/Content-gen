import React from "react";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { z } from "zod";
import { AnimatedText } from "../components/AnimatedText";
import { NumberCounter } from "../components/NumberCounter";
import { FlashTransition } from "../components/FlashTransition";
import { COLORS, FONT_SIZES, SAFE_ZONE } from "../lib/constants";
import { FONTS } from "../lib/fonts";
import { sec, buildAdaptiveScenes } from "../lib/timing";
import { pulseScale, staggerDelay } from "../lib/effects";
import { snappyOut } from "../lib/easing";

export const StatsShowcaseSchema = z.object({
  durationInSeconds: z.number().optional(),
  stats: z.array(
    z.object({
      value: z.number(),
      suffix: z.string().default(""),
      label: z.string(),
    })
  ),
  headline: z.string().default("The Super Socializers"),
  ctaText: z.string().default("Be part of the story"),
});

type Props = z.infer<typeof StatsShowcaseSchema>;

export const StatsShowcase: React.FC<Props> = ({
  stats,
  headline,
  ctaText,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Scenes: headline (2s) → stats (per stat 2.5s) → CTA (4s)
  const statTime = sec(2.5);
  const headlineTime = sec(2);
  const ctaTime = sec(4);
  const totalStatTime = statTime * stats.length;
  const scenes = buildAdaptiveScenes([headlineTime, totalStatTime, ctaTime], durationInFrames);
  const [headlineScene, statsScene, ctaScene] = scenes;

  // Build individual stat scenes within the stats phase
  const statScenes = buildAdaptiveScenes(stats.map(() => statTime), statsScene.duration);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.dark }}>
      {/* Animated background */}
      <StatsBackground frame={frame} totalFrames={durationInFrames} />

      {/* Scene 1: Headline */}
      <Sequence from={headlineScene.start} durationInFrames={headlineScene.duration}>
        <AbsoluteFill
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: `${SAFE_ZONE.top}px ${SAFE_ZONE.horizontal}px ${SAFE_ZONE.bottom}px`,
          }}
        >
          <AnimatedText
            text={headline}
            mode="glitchIn"
            delay={2}
            fontSize={FONT_SIZES.headline}
            fontWeight={900}
            color={COLORS.white}
            textShadow
          />
        </AbsoluteFill>
      </Sequence>

      {/* Scene 2: Stats — one at a time */}
      {statScenes.map((scene, i) => (
        <Sequence
          key={i}
          from={statsScene.start + scene.start}
          durationInFrames={scene.duration}
        >
          <StatSlide
            value={stats[i].value}
            suffix={stats[i].suffix}
            label={stats[i].label}
          />
        </Sequence>
      ))}

      {/* Scene 3: CTA */}
      <Sequence from={ctaScene.start} durationInFrames={ctaScene.duration}>
        <CTASlide ctaText={ctaText} />
      </Sequence>

      {/* Flash between sections */}
      <FlashTransition triggerFrame={headlineScene.end - 2} color={COLORS.primary} peakOpacity={0.5} />
      {statScenes.map((scene, i) => (
        <FlashTransition
          key={i}
          triggerFrame={statsScene.start + scene.end - 2}
          duration={3}
        />
      ))}
    </AbsoluteFill>
  );
};

const StatSlide: React.FC<{
  value: number;
  suffix: string;
  label: string;
}> = ({ value, suffix, label }) => {
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
      <NumberCounter
        from={0}
        to={value}
        delay={2}
        duration={40}
        suffix={suffix}
        fontSize={180}
        color={COLORS.primary}
      />
      <AnimatedText
        text={label}
        mode="fadeUp"
        delay={10}
        fontSize={FONT_SIZES.body}
        fontWeight={700}
        color={COLORS.white}
        textShadow
      />
    </AbsoluteFill>
  );
};

const CTASlide: React.FC<{ ctaText: string }> = ({ ctaText }) => {
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
      <div style={{ transform: `scale(${scale})` }}>
        <AnimatedText
          text={ctaText}
          mode="scaleIn"
          delay={4}
          fontSize={FONT_SIZES.headline}
          fontWeight={900}
          color={COLORS.white}
          textShadow
        />
      </div>
      <AnimatedText
        text="Come alone. Leave with friends."
        mode="fadeUp"
        delay={16}
        fontSize={FONT_SIZES.body}
        fontWeight={800}
        color={COLORS.primary}
        textShadow
      />
      <AnimatedText
        text="Join us on Meetup"
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

const StatsBackground: React.FC<{
  frame: number;
  totalFrames: number;
}> = ({ frame, totalFrames }) => {
  const progress = frame / totalFrames;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* Gradient orbs */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          left: "10%",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.primary}18 0%, transparent 70%)`,
          transform: `scale(${1 + Math.sin(frame * 0.02) * 0.3})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "20%",
          right: "5%",
          width: 350,
          height: 350,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.secondary}20 0%, transparent 70%)`,
          transform: `scale(${1 + Math.cos(frame * 0.025) * 0.25})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "60%",
          width: 250,
          height: 250,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.accent}12 0%, transparent 70%)`,
          transform: `scale(${1 + Math.sin(frame * 0.03 + 1) * 0.2})`,
        }}
      />
    </AbsoluteFill>
  );
};
