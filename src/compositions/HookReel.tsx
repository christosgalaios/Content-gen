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
import { FlashTransition } from "../components/FlashTransition";
import { GradientOverlay } from "../components/GradientOverlay";
import { COLORS, FONT_SIZES, SAFE_ZONE } from "../lib/constants";
import { FONTS } from "../lib/fonts";
import { sec, buildScenes } from "../lib/timing";
import { snappyOut, punchyOvershoot } from "../lib/easing";
import { pulseScale, staggerDelay } from "../lib/effects";

export const HookReelSchema = z.object({
  hookText: z.string(),
  bodyLines: z.array(z.string()),
  ctaText: z.string().default("Come alone. Leave with friends."),
  backgroundImage: z.string().optional(),
});

type Props = z.infer<typeof HookReelSchema>;

export const HookReel: React.FC<Props> = ({
  hookText,
  bodyLines,
  ctaText,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Scenes: hook (3s) → body lines (8s) → CTA (4s)
  const bodyDuration = Math.max(sec(6), bodyLines.length * sec(1.8));
  const ctaDuration = sec(4);
  const hookDuration = durationInFrames - bodyDuration - ctaDuration;

  const scenes = buildScenes([hookDuration, bodyDuration, ctaDuration]);
  const [hookScene, bodyScene, ctaScene] = scenes;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.dark }}>
      {/* Animated background gradient */}
      <AnimatedBackground frame={frame} totalFrames={durationInFrames} />

      {/* Scene 1: Hook text */}
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
            text={hookText}
            mode="glitchIn"
            delay={4}
            fontSize={FONT_SIZES.hookTitle}
            fontWeight={900}
            color={COLORS.white}
            textShadow
          />
        </AbsoluteFill>
      </Sequence>

      {/* Scene 2: Body lines — staggered appearance */}
      <Sequence from={bodyScene.start} durationInFrames={bodyScene.duration}>
        <BodyLines lines={bodyLines} />
      </Sequence>

      {/* Scene 3: CTA */}
      <Sequence from={ctaScene.start} durationInFrames={ctaScene.duration}>
        <CTAScene ctaText={ctaText} />
      </Sequence>

      {/* Transitions */}
      <FlashTransition triggerFrame={hookScene.end - 2} color={COLORS.primary} peakOpacity={0.6} />
      <FlashTransition triggerFrame={bodyScene.end - 2} />
    </AbsoluteFill>
  );
};

const AnimatedBackground: React.FC<{ frame: number; totalFrames: number }> = ({
  frame,
  totalFrames,
}) => {
  const progress = frame / totalFrames;
  const hueShift = Math.sin(progress * Math.PI) * 15;

  return (
    <AbsoluteFill
      style={{
        background: `
          radial-gradient(ellipse at 30% 20%, ${COLORS.secondary}30 0%, transparent 50%),
          radial-gradient(ellipse at 70% 80%, ${COLORS.primary}20 0%, transparent 50%),
          ${COLORS.dark}
        `,
      }}
    />
  );
};

const BodyLines: React.FC<{ lines: string[] }> = ({ lines }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: `${SAFE_ZONE.top}px ${SAFE_ZONE.horizontal + 20}px ${SAFE_ZONE.bottom}px`,
        gap: 50,
      }}
    >
      {lines.map((line, i) => {
        const delay = staggerDelay(i, { baseDelay: 6, stagger: sec(1.5) });
        const f = frame - delay;
        if (f < 0) return <div key={i} style={{ height: 70, opacity: 0 }} />;

        const progress = interpolate(f, [0, 12], [0, 1], {
          extrapolateRight: "clamp",
          easing: snappyOut,
        });

        const translateX = interpolate(progress, [0, 1], [60, 0]);
        const lineOpacity = interpolate(progress, [0, 1], [0, 1]);

        // Highlight the week number with accent color
        const parts = line.match(/^(Week \d+:?\s*)(.*)/i);

        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              opacity: lineOpacity,
              transform: `translateX(${translateX}px)`,
            }}
          >
            {/* Accent bar */}
            <div
              style={{
                width: 6,
                height: 50,
                backgroundColor: COLORS.primary,
                borderRadius: 3,
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
                lineHeight: 1.3,
              }}
            >
              {parts ? (
                <>
                  <span style={{ color: COLORS.primary, fontWeight: 800 }}>{parts[1]}</span>
                  {parts[2]}
                </>
              ) : (
                line
              )}
            </span>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const CTAScene: React.FC<{ ctaText: string }> = ({ ctaText }) => {
  const frame = useCurrentFrame();

  const scale = frame > 20
    ? pulseScale(frame, { startFrame: 20, pulseAmount: 0.025, speed: 3 })
    : 1;

  // Split CTA on period for two-line effect
  const ctaParts = ctaText.split(".");
  const line1 = ctaParts[0] + (ctaParts.length > 1 ? "." : "");
  const line2 = ctaParts.length > 1 ? ctaParts[1].trim() : "";

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
          text={line1}
          mode="scaleIn"
          delay={4}
          fontSize={FONT_SIZES.headline}
          fontWeight={900}
          color={COLORS.white}
          textShadow
        />
      </div>
      {line2 && (
        <AnimatedText
          text={line2}
          mode="fadeUp"
          delay={14}
          fontSize={FONT_SIZES.headline}
          fontWeight={900}
          color={COLORS.primary}
          textShadow
        />
      )}
      <div style={{ marginTop: 20 }}>
        <AnimatedText
          text="Link in bio"
          mode="fadeUp"
          delay={24}
          fontSize={FONT_SIZES.small}
          fontWeight={700}
          color={COLORS.accent}
          textShadow
        />
      </div>
    </AbsoluteFill>
  );
};
