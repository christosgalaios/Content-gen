import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import { COLORS } from "../lib/constants";

interface SwipeTransitionProps {
  direction?: "left" | "right";
  color?: string;
  delay?: number;
  duration?: number;
}

/**
 * Animated vertical swipe divider that reveals the "after" side.
 */
export const SwipeTransition: React.FC<SwipeTransitionProps> = ({
  direction = "right",
  color = COLORS.primary,
  delay = 0,
  duration = 15,
}) => {
  const frame = useCurrentFrame();
  const f = frame - delay;

  if (f < 0) return null;

  const progress = interpolate(f, [0, duration], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

  const position = direction === "right"
    ? interpolate(progress, [0, 1], [0, 100])
    : interpolate(progress, [0, 1], [100, 0]);

  // Divider line
  const lineX = `${position}%`;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* Swipe reveal mask */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: direction === "right" ? 0 : `${position}%`,
          right: direction === "right" ? `${100 - position}%` : 0,
          bottom: 0,
          backgroundColor: "transparent",
        }}
      />
      {/* Divider line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: lineX,
          width: 4,
          backgroundColor: color,
          boxShadow: `0 0 20px ${color}80, 0 0 40px ${color}40`,
          transform: "translateX(-50%)",
          opacity: f < duration ? 1 : 0,
        }}
      />
      {/* Glow circle on divider */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: lineX,
          width: 40,
          height: 40,
          borderRadius: "50%",
          backgroundColor: color,
          boxShadow: `0 0 30px ${color}`,
          transform: "translate(-50%, -50%)",
          opacity: f < duration ? 0.8 : 0,
        }}
      />
    </AbsoluteFill>
  );
};
