import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";

interface MaskRevealProps {
  delay?: number;
  duration?: number;
  shape?: "circle" | "diamond";
  children: React.ReactNode;
}

/**
 * Expanding circle or diamond mask that reveals content underneath.
 */
export const MaskReveal: React.FC<MaskRevealProps> = ({
  delay = 0,
  duration = 20,
  shape = "circle",
  children,
}) => {
  const frame = useCurrentFrame();
  const f = frame - delay;

  if (f < 0) {
    return <AbsoluteFill style={{ opacity: 0 }}>{children}</AbsoluteFill>;
  }

  const progress = interpolate(f, [0, duration], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Scale from 0 to 150% (to cover corners)
  const radius = interpolate(progress, [0, 1], [0, 150]);

  let clipPath: string;
  if (shape === "circle") {
    clipPath = `circle(${radius}% at 50% 50%)`;
  } else {
    // Diamond: use polygon that expands
    const size = radius;
    clipPath = `polygon(50% ${50 - size}%, ${50 + size}% 50%, 50% ${50 + size}%, ${50 - size}% 50%)`;
  }

  return (
    <AbsoluteFill
      style={{
        clipPath,
        WebkitClipPath: clipPath,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
