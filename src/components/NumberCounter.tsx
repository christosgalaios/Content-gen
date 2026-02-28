import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS, FONT_SIZES } from "../lib/constants";
import { FONTS } from "../lib/fonts";

interface NumberCounterProps {
  from: number;
  to: number;
  delay?: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  fontSize?: number;
  color?: string;
  format?: "comma" | "none";
}

export const NumberCounter: React.FC<NumberCounterProps> = ({
  from,
  to,
  delay = 0,
  duration = 30,
  suffix = "",
  prefix = "",
  fontSize = FONT_SIZES.hookTitle,
  color = COLORS.primary,
  format = "comma",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - delay;

  if (f < 0) return null;

  const progress = spring({
    frame: f,
    fps,
    config: { damping: 40, mass: 1, stiffness: 80 },
    durationInFrames: duration,
  });

  const value = Math.round(interpolate(progress, [0, 1], [from, to]));
  const display = format === "comma" ? value.toLocaleString() : String(value);

  const scale = spring({
    frame: f,
    fps,
    config: { damping: 12, mass: 0.8, stiffness: 200 },
  });

  const opacity = interpolate(f, [0, 6], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div
      style={{
        fontFamily: FONTS.display,
        fontSize,
        fontWeight: 900,
        color,
        textAlign: "center",
        transform: `scale(${scale})`,
        opacity,
        textShadow: "2px 2px 0 rgba(0,0,0,0.8), 0 4px 8px rgba(0,0,0,0.5)",
        lineHeight: 1,
      }}
    >
      {prefix}{display}{suffix}
    </div>
  );
};
