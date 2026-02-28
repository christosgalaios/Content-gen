import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { snappyOut, sharpIn } from "../lib/easing";
import { COLORS } from "../lib/constants";

type TransitionType = "wipeDown" | "wipeRight" | "dissolve" | "zoomFade" | "splitReveal";

interface SceneTransitionProps {
  type: TransitionType;
  triggerFrame: number;
  duration?: number;
  color?: string;
}

export const SceneTransition: React.FC<SceneTransitionProps> = ({
  type,
  triggerFrame,
  duration = 8,
  color = COLORS.dark,
}) => {
  const frame = useCurrentFrame();
  const t = frame - triggerFrame;

  if (t < -2 || t > duration + 2) return null;

  const progress = interpolate(t, [0, duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: snappyOut,
  });

  switch (type) {
    case "wipeDown": {
      const coverY = interpolate(progress, [0, 0.5], [0, 100], { extrapolateRight: "clamp" });
      const revealY = interpolate(progress, [0.5, 1], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      return (
        <AbsoluteFill style={{ pointerEvents: "none", zIndex: 90 }}>
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: `${coverY}%`,
              backgroundColor: color,
              transform: progress > 0.5 ? `translateY(${revealY}%)` : undefined,
            }}
          />
        </AbsoluteFill>
      );
    }
    case "wipeRight": {
      const coverX = interpolate(progress, [0, 0.5], [0, 100], { extrapolateRight: "clamp" });
      const revealX = interpolate(progress, [0.5, 1], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      return (
        <AbsoluteFill style={{ pointerEvents: "none", zIndex: 90 }}>
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: `${coverX}%`,
              height: "100%",
              backgroundColor: color,
              transform: progress > 0.5 ? `translateX(${revealX}%)` : undefined,
            }}
          />
        </AbsoluteFill>
      );
    }
    case "dissolve": {
      const opacity = progress <= 0.5
        ? interpolate(progress, [0, 0.5], [0, 1])
        : interpolate(progress, [0.5, 1], [1, 0]);
      return (
        <AbsoluteFill
          style={{
            backgroundColor: color,
            opacity,
            pointerEvents: "none",
            zIndex: 90,
          }}
        />
      );
    }
    case "zoomFade": {
      const opacity = progress <= 0.5
        ? interpolate(progress, [0, 0.5], [0, 1])
        : interpolate(progress, [0.5, 1], [1, 0]);
      const scale = interpolate(progress, [0, 0.5, 1], [1.2, 1, 0.8]);
      return (
        <AbsoluteFill
          style={{
            backgroundColor: color,
            opacity,
            transform: `scale(${scale})`,
            pointerEvents: "none",
            zIndex: 90,
          }}
        />
      );
    }
    case "splitReveal": {
      const split = interpolate(progress, [0, 0.5], [0, 50], { extrapolateRight: "clamp" });
      const close = interpolate(progress, [0.5, 1], [50, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const half = progress <= 0.5 ? split : close;
      return (
        <AbsoluteFill style={{ pointerEvents: "none", zIndex: 90 }}>
          <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: `${half}%`, backgroundColor: color }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: `${half}%`, backgroundColor: color }} />
        </AbsoluteFill>
      );
    }
    default:
      return null;
  }
};
