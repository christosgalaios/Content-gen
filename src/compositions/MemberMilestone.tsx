import React from "react";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { AnimatedText } from "../components/AnimatedText";
import { NumberCounter } from "../components/NumberCounter";
import { FlashTransition } from "../components/FlashTransition";
import { COLORS, FONT_SIZES, SAFE_ZONE } from "../lib/constants";
import { FONTS } from "../lib/fonts";
import { sec, buildAdaptiveScenes } from "../lib/timing";
import { pulseScale } from "../lib/effects";

export const MemberMilestoneSchema = z.object({
  durationInSeconds: z.number().optional(),
  milestone: z.number().default(3000),
  suffix: z.string().default(""),
  preText: z.string().default("We just hit..."),
  celebrationText: z.string().default("members strong!"),
  thankYouText: z.string().default("Thank you for being part of this"),
});

type Props = z.infer<typeof MemberMilestoneSchema>;

export const MemberMilestone: React.FC<Props> = ({
  milestone,
  suffix,
  preText,
  celebrationText,
  thankYouText,
}) => {
  const { durationInFrames } = useVideoConfig();

  const hookDur = sec(2.5);
  const counterDur = sec(4);
  const celebrateDur = sec(3.5);
  const ctaDur = sec(4);

  const scenes = buildAdaptiveScenes([hookDur, counterDur, celebrateDur, ctaDur], durationInFrames);
  const [hookScene, counterScene, celebrateScene, ctaScene] = scenes;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.dark }}>
      {/* Particle/confetti background */}
      <CelebrationBackground />

      {/* Scene 1: Build-up text */}
      <Sequence from={hookScene.start} durationInFrames={hookScene.duration}>
        <AbsoluteFill
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: `${SAFE_ZONE.top}px ${SAFE_ZONE.horizontal}px ${SAFE_ZONE.bottom}px`,
          }}
        >
          <AnimatedText
            text={preText}
            mode="typewriter"
            delay={6}
            fontSize={FONT_SIZES.headline}
            fontWeight={900}
            color={COLORS.white}
            textShadow
          />
        </AbsoluteFill>
      </Sequence>

      {/* Scene 2: Counter animation */}
      <Sequence from={counterScene.start} durationInFrames={counterScene.duration}>
        <CounterScene milestone={milestone} suffix={suffix} />
      </Sequence>

      {/* Scene 3: Celebration + message */}
      <Sequence from={celebrateScene.start} durationInFrames={celebrateScene.duration}>
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
            text={`${milestone.toLocaleString()}${suffix}`}
            mode="bounce"
            delay={2}
            fontSize={FONT_SIZES.hookTitle}
            fontWeight={900}
            color={COLORS.accent}
            textShadow
          />
          <AnimatedText
            text={celebrationText}
            mode="scaleIn"
            delay={10}
            fontSize={FONT_SIZES.headline}
            fontWeight={900}
            color={COLORS.white}
            textShadow
          />
        </AbsoluteFill>
      </Sequence>

      {/* Scene 4: Thank you + CTA */}
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
            text={thankYouText}
            mode="fadeUp"
            delay={4}
            fontSize={FONT_SIZES.body}
            fontWeight={800}
            color={COLORS.white}
            textShadow
          />
          <AnimatedText
            text="Come alone. Leave with friends."
            mode="scaleIn"
            delay={16}
            fontSize={FONT_SIZES.headline}
            fontWeight={900}
            color={COLORS.primary}
            textShadow
          />
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
      </Sequence>

      <FlashTransition triggerFrame={hookScene.end - 2} color={COLORS.accent} peakOpacity={0.8} />
      <FlashTransition triggerFrame={counterScene.end - 2} color={COLORS.primary} peakOpacity={0.9} />
      <FlashTransition triggerFrame={celebrateScene.end - 2} />
    </AbsoluteFill>
  );
};

/** Animated number counter scene */
const CounterScene: React.FC<{ milestone: number; suffix: string }> = ({
  milestone,
  suffix,
}) => {
  const frame = useCurrentFrame();
  const pulse = frame > 80
    ? pulseScale(frame, { startFrame: 80, pulseAmount: 0.04, speed: 5 })
    : 1;

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: `${SAFE_ZONE.top}px ${SAFE_ZONE.horizontal}px ${SAFE_ZONE.bottom}px`,
        gap: 10,
      }}
    >
      <div style={{ transform: `scale(${pulse})` }}>
        <NumberCounter
          from={0}
          to={milestone}
          suffix={suffix}
          duration={70}
          fontSize={140}
          color={COLORS.accent}
        />
      </div>
      <AnimatedText
        text="and counting..."
        mode="fadeUp"
        delay={50}
        fontSize={FONT_SIZES.caption}
        fontWeight={800}
        color={COLORS.white}
        textShadow
      />
    </AbsoluteFill>
  );
};

/** Celebration background with floating particles */
const CelebrationBackground: React.FC = () => {
  const frame = useCurrentFrame();

  // Generate deterministic particles using sine
  const particles = Array.from({ length: 12 }, (_, i) => {
    const x = (Math.sin(i * 7.3 + 1.2) * 0.5 + 0.5) * 100;
    const speed = 0.3 + Math.abs(Math.sin(i * 3.7)) * 0.7;
    const y = ((frame * speed + i * 160) % 2200) - 200;
    const size = 4 + Math.abs(Math.sin(i * 11.1)) * 8;
    const opacity = 0.15 + Math.abs(Math.sin(i * 5.3)) * 0.25;
    const color = i % 3 === 0
      ? COLORS.primary
      : i % 3 === 1
        ? COLORS.accent
        : COLORS.secondary;

    return { x, y, size, opacity, color };
  });

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `
            radial-gradient(ellipse at 50% 40%, ${COLORS.primary}15 0%, transparent 60%),
            radial-gradient(ellipse at 30% 70%, ${COLORS.accent}10 0%, transparent 50%),
            ${COLORS.dark}
          `,
        }}
      />
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: p.y,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            backgroundColor: p.color,
            opacity: p.opacity,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};
