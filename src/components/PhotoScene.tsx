import React from "react";
import { AbsoluteFill, Img, useCurrentFrame, useVideoConfig } from "remotion";
import { kenBurns, shake } from "../lib/effects";
import { GradientOverlay } from "./GradientOverlay";
import { SAFE_ZONE } from "../lib/constants";

interface PhotoSceneProps {
  src: string;
  kenBurnsDirection?:
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right"
    | "center";
  startScale?: number;
  endScale?: number;
  vignette?: boolean;
  shakeOnEntry?: boolean;
  shakeDuration?: number;
  overlayOpacity?: number;
  children?: React.ReactNode;
}

export const PhotoScene: React.FC<PhotoSceneProps> = ({
  src,
  kenBurnsDirection = "center",
  startScale = 1.0,
  endScale = 1.15,
  vignette = true,
  shakeOnEntry = false,
  shakeDuration = 8,
  overlayOpacity = 0.3,
  children,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const imgTransform = kenBurns(frame, {
    startFrame: 0,
    duration: durationInFrames,
    startScale,
    endScale,
    direction: kenBurnsDirection,
  });

  const wrapperTransform =
    shakeOnEntry && frame < shakeDuration
      ? shake(frame, { intensity: 10, speed: 25, decay: 0.85, startFrame: 0 })
      : undefined;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {/* Photo with Ken Burns */}
      <div
        style={{
          width: "100%",
          height: "100%",
          transform: wrapperTransform,
        }}
      >
        <Img
          src={src}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: imgTransform,
          }}
        />
      </div>

      {/* Dark overlay for text readability */}
      {overlayOpacity > 0 && (
        <GradientOverlay direction="full" opacity={overlayOpacity} />
      )}

      {/* Vignette */}
      {vignette && (
        <AbsoluteFill
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Content overlay within safe zones */}
      {children && (
        <AbsoluteFill
          style={{
            padding: `${SAFE_ZONE.top}px ${SAFE_ZONE.horizontal}px ${SAFE_ZONE.bottom}px`,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {children}
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
