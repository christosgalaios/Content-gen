import React from "react";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import { AnimatedText, AnimationMode } from "../components/AnimatedText";
import { FlashTransition } from "../components/FlashTransition";
import { COLORS, FONT_SIZES, SAFE_ZONE } from "../lib/constants";
import { FONTS } from "../lib/fonts";
import { sec, buildScenes } from "../lib/timing";
import { pulseScale } from "../lib/effects";
import { snappyOut } from "../lib/easing";

export const TextAnimationSchema = z.object({
  durationInSeconds: z.number().optional(),
  lines: z.array(z.string()),
  backgroundColor: zColor().default("#1A1A2E"),
  textColor: zColor().default("#FFFFFF"),
  accentColor: zColor().default("#FF6B35"),
});

type Props = z.infer<typeof TextAnimationSchema>;

// Cycle through animation modes for variety
const MODES: AnimationMode[] = ["scaleIn", "glitchIn", "bounce", "wordByWord"];

export const TextAnimation: React.FC<Props> = ({
  lines,
  backgroundColor,
  textColor,
  accentColor,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Each line gets equal time, last line gets extra for lingering
  const lineTime = sec(2);
  const lastExtra = durationInFrames - lineTime * lines.length;
  const durations = lines.map((_, i) =>
    i === lines.length - 1 ? lineTime + Math.max(0, lastExtra) : lineTime
  );
  const scenes = buildScenes(durations);

  return (
    <AbsoluteFill style={{ backgroundColor }}>
      {/* Animated accent elements */}
      <AccentDecor frame={frame} totalFrames={durationInFrames} color={accentColor} />

      {scenes.map((scene, i) => (
        <Sequence key={i} from={scene.start} durationInFrames={scene.duration}>
          <LineSlide
            text={lines[i]}
            mode={MODES[i % MODES.length]}
            textColor={textColor}
            accentColor={accentColor}
            isLast={i === lines.length - 1}
          />
          {/* Exit fade for non-last lines */}
          {i < lines.length - 1 && (
            <ExitFade startFrame={scene.duration - 8} />
          )}
        </Sequence>
      ))}

      {/* Flash between lines */}
      {scenes.slice(0, -1).map((scene, i) => (
        <FlashTransition
          key={i}
          triggerFrame={scene.end - 2}
          color={accentColor}
          peakOpacity={0.4}
          duration={3}
        />
      ))}
    </AbsoluteFill>
  );
};

const LineSlide: React.FC<{
  text: string;
  mode: AnimationMode;
  textColor: string;
  accentColor: string;
  isLast: boolean;
}> = ({ text, mode, textColor, accentColor, isLast }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = isLast && frame > 20
    ? pulseScale(frame, { startFrame: 20, pulseAmount: 0.02, speed: 3 })
    : 1;

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: `${SAFE_ZONE.top}px ${SAFE_ZONE.horizontal + 40}px ${SAFE_ZONE.bottom}px`,
        transform: `scale(${scale})`,
      }}
    >
      <AnimatedText
        text={text}
        mode={mode}
        delay={4}
        fontSize={FONT_SIZES.headline}
        fontWeight={900}
        color={isLast ? accentColor : textColor}
        textShadow
        lineHeight={1.2}
        maxWidth={950}
      />
    </AbsoluteFill>
  );
};

const ExitFade: React.FC<{ startFrame: number }> = ({ startFrame }) => {
  const frame = useCurrentFrame();
  const f = frame - startFrame;
  if (f < 0) return null;

  const opacity = interpolate(f, [0, 8], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.dark,
        opacity,
        pointerEvents: "none",
      }}
    />
  );
};

const AccentDecor: React.FC<{
  frame: number;
  totalFrames: number;
  color: string;
}> = ({ frame, totalFrames, color }) => {
  const progress = frame / totalFrames;

  // Floating accent circles
  const circles = [
    { x: 15, y: 20, size: 200, speed: 0.3 },
    { x: 80, y: 75, size: 150, speed: 0.5 },
    { x: 50, y: 10, size: 100, speed: 0.7 },
  ];

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {circles.map((c, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${c.x}%`,
            top: `${c.y + Math.sin(frame * c.speed * 0.05) * 5}%`,
            width: c.size,
            height: c.size,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${color}15 0%, transparent 70%)`,
            transform: `scale(${1 + Math.sin(frame * 0.03 + i) * 0.2})`,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};
