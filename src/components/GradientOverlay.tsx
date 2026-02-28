import React from "react";
import { AbsoluteFill } from "remotion";

interface GradientOverlayProps {
  direction?: "top" | "bottom" | "full";
  opacity?: number;
  color?: string;
}

export const GradientOverlay: React.FC<GradientOverlayProps> = ({
  direction = "bottom",
  opacity = 0.7,
  color = "#000000",
}) => {
  let background: string;
  switch (direction) {
    case "bottom":
      background = `linear-gradient(to top, ${color}${alphaHex(opacity)} 0%, transparent 60%)`;
      break;
    case "top":
      background = `linear-gradient(to bottom, ${color}${alphaHex(opacity)} 0%, transparent 60%)`;
      break;
    case "full":
      background = `${color}${alphaHex(opacity * 0.5)}`;
      break;
  }

  return (
    <AbsoluteFill style={{ background, pointerEvents: "none" }} />
  );
};

function alphaHex(opacity: number): string {
  return Math.round(opacity * 255)
    .toString(16)
    .padStart(2, "0");
}
