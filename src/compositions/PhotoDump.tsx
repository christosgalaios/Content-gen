import React from "react";
import {
  AbsoluteFill,
  Sequence,
  Img,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
  staticFile,
} from "remotion";
import { z } from "zod";
import { AnimatedText } from "../components/AnimatedText";
import { FlashTransition } from "../components/FlashTransition";
import { GradientOverlay } from "../components/GradientOverlay";
import { COLORS, FONT_SIZES, SAFE_ZONE } from "../lib/constants";
import { sec, buildAdaptiveScenes } from "../lib/timing";
import { staggerDelay, pulseScale } from "../lib/effects";

export const PhotoDumpSchema = z.object({
  durationInSeconds: z.number().optional(),
  title: z.string().default("This week's photo dump"),
  photos: z.array(z.string()).default([]),
  ctaText: z.string().default("Join the adventure"),
});

type Props = z.infer<typeof PhotoDumpSchema>;

export const PhotoDump: React.FC<Props> = ({
  title,
  photos,
  ctaText,
}) => {
  const { durationInFrames } = useVideoConfig();

  const hookDur = sec(2);
  const gridDur = sec(6);
  const zoomDur = sec(3);
  const ctaDur = sec(4);

  const scenes = buildAdaptiveScenes([hookDur, gridDur, zoomDur, ctaDur], durationInFrames);
  const [hookScene, gridScene, zoomScene, ctaScene] = scenes;

  // Default photos
  const photoSrcs =
    photos.length > 0
      ? photos.map((p) => staticFile(p))
      : [
          staticFile("assets/group-walk-1.jpg"),
          staticFile("assets/group-outdoor-1.jpg"),
          staticFile("assets/group-activity-1.jpg"),
          staticFile("assets/hike-1.jpg"),
          staticFile("assets/group-walk-1.jpg"),
          staticFile("assets/group-outdoor-1.jpg"),
        ];

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.dark }}>
      {/* Scene 1: Title */}
      <Sequence from={hookScene.start} durationInFrames={hookScene.duration}>
        <AbsoluteFill
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: `${SAFE_ZONE.top}px ${SAFE_ZONE.horizontal}px ${SAFE_ZONE.bottom}px`,
          }}
        >
          <AnimatedText
            text={title}
            mode="glitchIn"
            delay={4}
            fontSize={FONT_SIZES.headline}
            fontWeight={900}
            color={COLORS.white}
            textShadow
          />
        </AbsoluteFill>
      </Sequence>

      {/* Scene 2: Grid builds up */}
      <Sequence from={gridScene.start} durationInFrames={gridScene.duration}>
        <PhotoGrid photos={photoSrcs} />
      </Sequence>

      {/* Scene 3: Zoom into featured photo */}
      <Sequence from={zoomScene.start} durationInFrames={zoomScene.duration}>
        <ZoomIntoPhoto src={photoSrcs[0]} />
      </Sequence>

      {/* Scene 4: CTA */}
      <Sequence from={ctaScene.start} durationInFrames={ctaScene.duration}>
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: `${SAFE_ZONE.top}px ${SAFE_ZONE.horizontal}px ${SAFE_ZONE.bottom}px`,
            gap: 30,
          }}
        >
          <AnimatedText
            text={ctaText}
            mode="scaleIn"
            delay={4}
            fontSize={FONT_SIZES.headline}
            fontWeight={900}
            color={COLORS.primary}
            textShadow
          />
          <AnimatedText
            text="Come alone. Leave with friends."
            mode="fadeUp"
            delay={14}
            fontSize={FONT_SIZES.caption}
            fontWeight={800}
            color={COLORS.white}
            textShadow
          />
          <AnimatedText
            text="Link in bio"
            mode="fadeUp"
            delay={22}
            fontSize={FONT_SIZES.small}
            fontWeight={700}
            color={COLORS.accent}
            textShadow
          />
        </AbsoluteFill>
      </Sequence>

      <FlashTransition triggerFrame={hookScene.end - 2} color={COLORS.primary} peakOpacity={0.5} />
      <FlashTransition triggerFrame={gridScene.end - 2} />
      <FlashTransition triggerFrame={zoomScene.end - 2} />
    </AbsoluteFill>
  );
};

/** 2x3 photo grid with staggered entrance */
const PhotoGrid: React.FC<{ photos: string[] }> = ({ photos }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const gridPhotos = photos.slice(0, 6);

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: `${SAFE_ZONE.top + 40}px ${SAFE_ZONE.horizontal + 20}px ${SAFE_ZONE.bottom + 40}px`,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridTemplateRows: "1fr 1fr 1fr",
          gap: 12,
          width: "100%",
          height: "100%",
        }}
      >
        {gridPhotos.map((src, i) => {
          const delay = staggerDelay(i, { baseDelay: 6, stagger: 12 });
          const f = frame - delay;
          if (f < 0) return <div key={i} style={{ backgroundColor: "#222", borderRadius: 12 }} />;

          const scale = spring({
            frame: f,
            fps,
            config: { damping: 12, mass: 0.6, stiffness: 200 },
          });

          const opacity = interpolate(f, [0, 6], [0, 1], { extrapolateRight: "clamp" });

          return (
            <div
              key={i}
              style={{
                borderRadius: 12,
                overflow: "hidden",
                transform: `scale(${scale})`,
                opacity,
              }}
            >
              <Img
                src={src}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/** Zoom into a single photo from the grid */
const ZoomIntoPhoto: React.FC<{ src: string }> = ({ src }) => {
  const frame = useCurrentFrame();

  const scale = interpolate(frame, [0, 60], [0.5, 1.1], {
    extrapolateRight: "clamp",
  });

  const borderRadius = interpolate(frame, [0, 30], [12, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <div
        style={{
          width: "100%",
          height: "100%",
          transform: `scale(${scale})`,
          borderRadius,
          overflow: "hidden",
        }}
      >
        <Img
          src={src}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>
      <GradientOverlay direction="bottom" opacity={0.5} />
    </AbsoluteFill>
  );
};
