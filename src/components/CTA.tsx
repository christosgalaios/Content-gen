import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { AnimatedText } from "./AnimatedText";
import { pulseScale } from "../lib/effects";
import { COLORS, SAFE_ZONE, FONT_SIZES } from "../lib/constants";

interface CTAProps {
  text: string;
  subText?: string;
  delay?: number;
  style?: "pulse" | "glow" | "bounce";
}

export const CTA: React.FC<CTAProps> = ({
  text,
  subText,
  delay = 0,
  style: ctaStyle = "pulse",
}) => {
  const frame = useCurrentFrame();
  const f = frame - delay;

  // Container animation
  const scale =
    ctaStyle === "pulse" && f > 15
      ? pulseScale(frame, { startFrame: delay + 15, pulseAmount: 0.03, speed: 3 })
      : 1;

  const glowShadow =
    ctaStyle === "glow" && f > 15
      ? `0 0 ${20 + Math.sin((f - 15) * 0.15) * 20}px ${COLORS.primary}60`
      : undefined;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.dark,
        background: `radial-gradient(ellipse at center, ${COLORS.secondary}40 0%, ${COLORS.dark} 70%)`,
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: `${SAFE_ZONE.top}px ${SAFE_ZONE.horizontal}px ${SAFE_ZONE.bottom}px`,
          transform: `scale(${scale})`,
          boxShadow: glowShadow,
        }}
      >
        <AnimatedText
          text={text}
          mode={ctaStyle === "bounce" ? "bounce" : "scaleIn"}
          delay={delay}
          fontSize={FONT_SIZES.headline}
          fontWeight={900}
          color={COLORS.white}
          textAlign="center"
        />
        {subText && (
          <div style={{ marginTop: 40 }}>
            <AnimatedText
              text={subText}
              mode="fadeUp"
              delay={delay + 12}
              fontSize={FONT_SIZES.caption}
              fontWeight={700}
              color={COLORS.accent}
              textAlign="center"
            />
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
