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
import { FlashTransition } from "../components/FlashTransition";
import { COLORS, FONT_SIZES, SAFE_ZONE } from "../lib/constants";
import { FONTS } from "../lib/fonts";
import { sec, buildAdaptiveScenes } from "../lib/timing";
import { pulseScale, staggerDelay } from "../lib/effects";
import { snappyOut } from "../lib/easing";

export const QuizPollSchema = z.object({
  durationInSeconds: z.number().optional(),
  question: z.string().default("Which event should we run next?"),
  options: z.array(z.string()).default([
    "Sunset hike",
    "Board game night",
    "Speed friending",
    "Beach day trip",
  ]),
  revealIndex: z.number().default(2),
  revealLabel: z.string().default("You chose..."),
  ctaText: z.string().default("Comment below!"),
});

type Props = z.infer<typeof QuizPollSchema>;

export const QuizPoll: React.FC<Props> = ({
  question,
  options,
  revealIndex,
  revealLabel,
  ctaText,
}) => {
  const { durationInFrames } = useVideoConfig();

  const hookDur = sec(2.5);
  const optionsDur = sec(5);
  const revealDur = sec(3);
  const ctaDur = sec(3.5);

  const scenes = buildAdaptiveScenes([hookDur, optionsDur, revealDur, ctaDur], durationInFrames);
  const [hookScene, optionsScene, revealScene, ctaScene] = scenes;

  const safeRevealIndex = Math.min(revealIndex, options.length - 1);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.dark }}>
      {/* Animated background gradient */}
      <PollBackground />

      {/* Scene 1: Question hook */}
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
            text={question}
            mode="scaleIn"
            delay={4}
            fontSize={FONT_SIZES.headline}
            fontWeight={900}
            color={COLORS.white}
            textShadow
          />
        </AbsoluteFill>
      </Sequence>

      {/* Scene 2: Options appear one by one */}
      <Sequence from={optionsScene.start} durationInFrames={optionsScene.duration}>
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
          {/* Question at top */}
          <div
            style={{
              fontFamily: FONTS.display,
              fontSize: FONT_SIZES.caption,
              fontWeight: 800,
              color: COLORS.accent,
              textAlign: "center",
              marginBottom: 20,
            }}
          >
            {question}
          </div>

          {/* Options */}
          {options.map((option, i) => (
            <OptionPill key={i} text={option} index={i} label={String.fromCharCode(65 + i)} />
          ))}
        </AbsoluteFill>
      </Sequence>

      {/* Scene 3: Reveal winner */}
      <Sequence from={revealScene.start} durationInFrames={revealScene.duration}>
        <RevealScene
          label={revealLabel}
          winner={options[safeRevealIndex]}
          winnerLetter={String.fromCharCode(65 + safeRevealIndex)}
        />
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
            mode="bounce"
            delay={4}
            fontSize={FONT_SIZES.hookTitle}
            fontWeight={900}
            color={COLORS.primary}
            textShadow
          />
          <AnimatedText
            text="Drop your answer in the comments"
            mode="fadeUp"
            delay={14}
            fontSize={FONT_SIZES.caption}
            fontWeight={800}
            color={COLORS.white}
            textShadow
          />
          <AnimatedText
            text="Link in bio"
            mode="fadeUp"
            delay={22}
            fontSize={FONT_SIZES.small}
            fontWeight={700}
            color={COLORS.accent}
            textShadow
          />
        </AbsoluteFill>
      </Sequence>

      <FlashTransition triggerFrame={hookScene.end - 2} color={COLORS.primary} peakOpacity={0.6} />
      <FlashTransition triggerFrame={optionsScene.end - 2} color={COLORS.accent} peakOpacity={0.7} />
      <FlashTransition triggerFrame={revealScene.end - 2} />
    </AbsoluteFill>
  );
};

/** Animated background with subtle shifting gradient */
const PollBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const shift = Math.sin(frame * 0.02) * 10;

  return (
    <AbsoluteFill
      style={{
        background: `
          radial-gradient(ellipse at ${50 + shift}% 30%, ${COLORS.primary}20 0%, transparent 50%),
          radial-gradient(ellipse at ${50 - shift}% 70%, ${COLORS.secondary}25 0%, transparent 50%),
          ${COLORS.dark}
        `,
      }}
    />
  );
};

/** Single option pill with staggered entrance */
const OptionPill: React.FC<{
  text: string;
  index: number;
  label: string;
}> = ({ text, index, label }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const delay = staggerDelay(index, { baseDelay: 8, stagger: 18 });
  const f = frame - delay;

  if (f < 0) return null;

  const scale = spring({
    frame: f,
    fps,
    config: { damping: 12, mass: 0.5, stiffness: 200 },
  });

  const opacity = interpolate(f, [0, 6], [0, 1], { extrapolateRight: "clamp" });
  const slideX = interpolate(f, [0, 10], [80, 0], {
    extrapolateRight: "clamp",
    easing: snappyOut,
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 20,
        width: "90%",
        padding: "24px 32px",
        backgroundColor: `${COLORS.secondary}80`,
        borderRadius: 20,
        border: `3px solid ${COLORS.primary}60`,
        transform: `scale(${scale}) translateX(${slideX}px)`,
        opacity,
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: COLORS.primary,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: FONTS.display,
            fontSize: 36,
            fontWeight: 900,
            color: COLORS.white,
          }}
        >
          {label}
        </span>
      </div>
      <span
        style={{
          fontFamily: FONTS.display,
          fontSize: FONT_SIZES.body,
          fontWeight: 800,
          color: COLORS.white,
          textShadow: "0 2px 8px rgba(0,0,0,0.5)",
        }}
      >
        {text}
      </span>
    </div>
  );
};

/** Reveal animation for the winning option */
const RevealScene: React.FC<{
  label: string;
  winner: string;
  winnerLetter: string;
}> = ({ label, winner, winnerLetter }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pillScale = frame > 20
    ? spring({
        frame: frame - 20,
        fps,
        config: { damping: 8, mass: 0.8, stiffness: 180 },
      })
    : 0;

  const pulse = frame > 40
    ? pulseScale(frame, { startFrame: 40, pulseAmount: 0.03, speed: 4 })
    : 1;

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: `${SAFE_ZONE.top}px ${SAFE_ZONE.horizontal}px ${SAFE_ZONE.bottom}px`,
        gap: 40,
      }}
    >
      <AnimatedText
        text={label}
        mode="fadeUp"
        delay={2}
        fontSize={FONT_SIZES.caption}
        fontWeight={800}
        color={COLORS.accent}
        textShadow
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
          padding: "32px 48px",
          backgroundColor: `${COLORS.primary}DD`,
          borderRadius: 24,
          border: `4px solid ${COLORS.accent}`,
          transform: `scale(${pillScale * pulse})`,
          boxShadow: `0 0 40px ${COLORS.primary}60, 0 0 80px ${COLORS.primary}30`,
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 36,
            backgroundColor: COLORS.accent,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: FONTS.display,
              fontSize: 40,
              fontWeight: 900,
              color: COLORS.dark,
            }}
          >
            {winnerLetter}
          </span>
        </div>
        <span
          style={{
            fontFamily: FONTS.display,
            fontSize: FONT_SIZES.headline,
            fontWeight: 900,
            color: COLORS.white,
            textShadow: "0 2px 12px rgba(0,0,0,0.5)",
          }}
        >
          {winner}
        </span>
      </div>
    </AbsoluteFill>
  );
};
