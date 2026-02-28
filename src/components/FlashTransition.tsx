import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { flash } from "../lib/effects";

interface FlashTransitionProps {
  triggerFrame: number;
  duration?: number;
  color?: string;
  peakOpacity?: number;
}

export const FlashTransition: React.FC<FlashTransitionProps> = ({
  triggerFrame,
  duration = 4,
  color = "#FFFFFF",
  peakOpacity = 0.9,
}) => {
  const frame = useCurrentFrame();
  const opacity = flash(frame, {
    startFrame: triggerFrame,
    duration,
    peakOpacity,
  });

  if (opacity <= 0) return null;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: color,
        opacity,
        pointerEvents: "none",
        zIndex: 100,
      }}
    />
  );
};
