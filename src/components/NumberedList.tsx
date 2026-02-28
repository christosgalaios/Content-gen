import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS, FONT_SIZES, SAFE_ZONE } from "../lib/constants";
import { FONTS } from "../lib/fonts";
import { snappyOut } from "../lib/easing";
import { staggerDelay } from "../lib/effects";

interface NumberedListProps {
  items: string[];
  startIndex?: number;
  accentColor?: string;
  staggerFrames?: number;
}

/**
 * Animated numbered list with entrance animations per item.
 */
export const NumberedList: React.FC<NumberedListProps> = ({
  items,
  startIndex = 1,
  accentColor = COLORS.primary,
  staggerFrames = 25,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 36,
        padding: `0 ${SAFE_ZONE.horizontal + 20}px`,
        width: "100%",
      }}
    >
      {items.map((item, i) => {
        const delay = staggerDelay(i, { baseDelay: 6, stagger: staggerFrames });
        const f = frame - delay;
        if (f < 0) return <div key={i} style={{ height: 80, opacity: 0 }} />;

        const scale = spring({
          frame: f,
          fps,
          config: { damping: 12, mass: 0.8, stiffness: 200 },
        });

        const slideX = interpolate(f, [0, 10], [80, 0], {
          extrapolateRight: "clamp",
          easing: snappyOut,
        });

        const opacity = interpolate(f, [0, 6], [0, 1], {
          extrapolateRight: "clamp",
        });

        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 24,
              opacity,
              transform: `translateX(${slideX}px)`,
            }}
          >
            {/* Number circle */}
            <div
              style={{
                width: 70,
                height: 70,
                borderRadius: "50%",
                backgroundColor: accentColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transform: `scale(${scale})`,
                boxShadow: `0 4px 15px ${accentColor}60`,
              }}
            >
              <span
                style={{
                  fontFamily: FONTS.display,
                  fontSize: 36,
                  fontWeight: 900,
                  color: COLORS.white,
                }}
              >
                {startIndex + i}
              </span>
            </div>

            {/* Item text */}
            <span
              style={{
                fontFamily: FONTS.display,
                fontSize: FONT_SIZES.caption,
                fontWeight: 700,
                color: COLORS.white,
                textShadow: "2px 2px 0 rgba(0,0,0,0.8)",
                lineHeight: 1.2,
                flex: 1,
              }}
            >
              {item}
            </span>
          </div>
        );
      })}
    </div>
  );
};
