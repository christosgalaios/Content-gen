import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { COLORS, FONT_SIZES, SAFE_ZONE } from "../lib/constants";
import { FONTS } from "../lib/fonts";
import { snappyOut } from "../lib/easing";

interface CaptionProps {
  text: string;
  highlightWord?: string;
  highlightColor?: string;
  fontSize?: number;
  position?: "bottom" | "center" | "top";
  animate?: boolean;
  delay?: number;
  background?: boolean;
}

export const Caption: React.FC<CaptionProps> = ({
  text,
  highlightWord,
  highlightColor = COLORS.primary,
  fontSize = FONT_SIZES.caption,
  position = "bottom",
  animate = true,
  delay = 0,
  background = false,
}) => {
  const frame = useCurrentFrame();
  const f = frame - delay;

  let opacity = 1;
  let translateY = 0;
  if (animate) {
    if (f < 0) return null;
    const progress = interpolate(f, [0, 8], [0, 1], {
      extrapolateRight: "clamp",
      easing: snappyOut,
    });
    opacity = progress;
    translateY = interpolate(progress, [0, 1], [30, 0]);
  }

  const positionStyle: React.CSSProperties = {
    position: "absolute",
    left: SAFE_ZONE.horizontal,
    right: SAFE_ZONE.horizontal,
    ...(position === "bottom" && { bottom: 400 }),
    ...(position === "center" && { top: "50%", transform: `translateY(-50%) translateY(${translateY}px)` }),
    ...(position === "top" && { top: 300 }),
  };

  if (position !== "center") {
    positionStyle.transform = `translateY(${translateY}px)`;
  }

  const words = text.split(" ");

  return (
    <div style={{ ...positionStyle, opacity, textAlign: "center" }}>
      <div
        style={{
          display: "inline-block",
          ...(background && {
            backgroundColor: "rgba(0,0,0,0.6)",
            borderRadius: 16,
            padding: "12px 24px",
          }),
        }}
      >
        <span
          style={{
            fontFamily: FONTS.display,
            fontSize,
            fontWeight: 700,
            color: COLORS.white,
            textShadow: "0 2px 4px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.4)",
            lineHeight: 1.2,
          }}
        >
          {words.map((word, i) => (
            <span
              key={i}
              style={{
                color:
                  highlightWord && word.toLowerCase().includes(highlightWord.toLowerCase())
                    ? highlightColor
                    : COLORS.white,
              }}
            >
              {word}
              {i < words.length - 1 ? " " : ""}
            </span>
          ))}
        </span>
      </div>
    </div>
  );
};
