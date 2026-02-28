import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS, FONT_SIZES } from "../lib/constants";
import { FONTS } from "../lib/fonts";
import { snappyOut } from "../lib/easing";

interface BadgeProps {
  text: string;
  delay?: number;
  color?: string;
  backgroundColor?: string;
  fontSize?: number;
  icon?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  text,
  delay = 0,
  color = COLORS.dark,
  backgroundColor = COLORS.accent,
  fontSize = FONT_SIZES.small,
  icon,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - delay;

  if (f < 0) return null;

  const scale = spring({
    frame: f,
    fps,
    config: { damping: 14, mass: 0.6, stiffness: 260 },
  });

  const opacity = interpolate(f, [0, 5], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 12,
        backgroundColor,
        borderRadius: 50,
        padding: "14px 36px",
        transform: `scale(${scale})`,
        opacity,
      }}
    >
      {icon && <span style={{ fontSize: fontSize * 1.1 }}>{icon}</span>}
      <span
        style={{
          fontFamily: FONTS.display,
          fontSize,
          fontWeight: 800,
          color,
          textTransform: "uppercase",
          letterSpacing: 2,
        }}
      >
        {text}
      </span>
    </div>
  );
};
