import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS, FONT_SIZES, SAFE_ZONE } from "../lib/constants";
import { FONTS } from "../lib/fonts";

interface TikTokCaptionProps {
  text: string;
  wordsPerGroup?: number;
  highlightColor?: string;
  backgroundColor?: string;
  position?: "center" | "bottom";
  startFrame?: number;
}

/**
 * TikTok-style word-by-word animated captions.
 * Words appear in groups with highlight on the active group.
 */
export const TikTokCaption: React.FC<TikTokCaptionProps> = ({
  text,
  wordsPerGroup = 3,
  highlightColor = COLORS.primary,
  backgroundColor = "rgba(0,0,0,0.7)",
  position = "center",
  startFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - startFrame;

  if (f < 0) return null;

  const words = text.split(/\s+/);
  const groups: string[][] = [];

  for (let i = 0; i < words.length; i += wordsPerGroup) {
    groups.push(words.slice(i, i + wordsPerGroup));
  }

  // Each group gets ~18 frames (0.6s at 30fps)
  const framesPerGroup = 18;
  const currentGroupIndex = Math.min(
    Math.floor(f / framesPerGroup),
    groups.length - 1,
  );

  const positionStyle: React.CSSProperties =
    position === "center"
      ? { top: "50%", transform: "translateY(-50%)" }
      : { bottom: SAFE_ZONE.bottom + 60 };

  // Entry animation for the current group
  const groupFrame = f - currentGroupIndex * framesPerGroup;
  const groupScale = spring({
    frame: Math.max(0, groupFrame),
    fps,
    config: { damping: 15, mass: 0.6, stiffness: 250 },
  });

  return (
    <div
      style={{
        position: "absolute",
        left: SAFE_ZONE.horizontal,
        right: SAFE_ZONE.horizontal,
        ...positionStyle,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          backgroundColor,
          borderRadius: 16,
          padding: "16px 28px",
          display: "inline-flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "4px 12px",
          transform: `scale(${groupScale})`,
        }}
      >
        {groups[currentGroupIndex]?.map((word, wi) => {
          const wordDelay = wi * 3;
          const wf = groupFrame - wordDelay;
          const opacity = interpolate(wf, [0, 4], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          return (
            <span
              key={`${currentGroupIndex}-${wi}`}
              style={{
                fontFamily: FONTS.display,
                fontSize: FONT_SIZES.body,
                fontWeight: 900,
                color: highlightColor,
                textShadow: "2px 2px 0 rgba(0,0,0,0.9)",
                opacity,
                display: "inline-block",
                textTransform: "uppercase",
              }}
            >
              {word}
            </span>
          );
        })}
      </div>
    </div>
  );
};
