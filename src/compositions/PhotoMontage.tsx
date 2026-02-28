import React from "react";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  Img,
  staticFile,
  interpolate,
  spring,
} from "remotion";
import { z } from "zod";
import { AnimatedText } from "../components/AnimatedText";
import { GradientOverlay } from "../components/GradientOverlay";
import { FlashTransition } from "../components/FlashTransition";
import { COLORS, FONT_SIZES, SAFE_ZONE } from "../lib/constants";
import { FONTS } from "../lib/fonts";
import { kenBurns, pulseScale, staggerDelay } from "../lib/effects";
import { sec, buildScenes } from "../lib/timing";
import { snappyOut } from "../lib/easing";

export const PhotoMontageSchema = z.object({
  durationInSeconds: z.number().optional(),
  images: z.array(z.string()),
  overlayText: z.string().optional(),
  ctaText: z.string().default("Join 2,900+ members on Meetup"),
});

type Props = z.infer<typeof PhotoMontageSchema>;

const DEFAULT_IMAGES = [
  staticFile("assets/group-outdoor-1.jpg"),
  staticFile("assets/group-walk-1.jpg"),
  staticFile("assets/group-activity-1.jpg"),
  staticFile("assets/hike-1.jpg"),
];

const KB_DIRECTIONS = [
  "top-left", "top-right", "bottom-left", "bottom-right", "center",
] as const;

export const PhotoMontage: React.FC<Props> = ({
  images: rawImages,
  overlayText,
  ctaText,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const images = rawImages.length > 0 ? rawImages : DEFAULT_IMAGES;
  const isSquare = width === height;

  // Scenes: photo reveal (70%) → overlay text + CTA (30%)
  const photoDuration = Math.round(durationInFrames * 0.7);
  const ctaDuration = durationInFrames - photoDuration;
  const scenes = buildScenes([photoDuration, ctaDuration]);
  const [photoScene, ctaScene] = scenes;

  // Each photo gets equal time in the photo phase
  const photoTime = Math.floor(photoDuration / images.length);
  const photoScenes = buildScenes(
    images.map((_, i) =>
      i === images.length - 1 ? photoDuration - photoTime * (images.length - 1) : photoTime
    )
  );

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.dark }}>
      {/* Photo slides */}
      {photoScenes.map((scene, i) => (
        <Sequence key={i} from={scene.start} durationInFrames={scene.duration}>
          <PhotoSlide
            src={images[i]}
            direction={KB_DIRECTIONS[i % KB_DIRECTIONS.length]}
            index={i}
          />
        </Sequence>
      ))}

      {/* Flash transitions between photos */}
      {photoScenes.slice(0, -1).map((scene, i) => (
        <FlashTransition key={i} triggerFrame={scene.end - 2} duration={3} />
      ))}

      {/* Overlay text + CTA */}
      <Sequence from={ctaScene.start} durationInFrames={ctaScene.duration}>
        <CTAOverlay overlayText={overlayText} ctaText={ctaText} />
      </Sequence>

      <FlashTransition triggerFrame={photoScene.end - 2} />

      {/* Photo counter dots */}
      <PhotoDots
        total={images.length}
        photoScenes={photoScenes}
        frame={frame}
      />
    </AbsoluteFill>
  );
};

const PhotoSlide: React.FC<{
  src: string;
  direction: typeof KB_DIRECTIONS[number];
  index: number;
}> = ({ src, direction, index }) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();

  const bgTransform = kenBurns(frame, {
    startFrame: 0,
    duration: durationInFrames,
    startScale: 1.05,
    endScale: 1.2,
    direction,
  });

  // Entry animation
  const entryProgress = interpolate(frame, [0, 8], [0, 1], {
    extrapolateRight: "clamp",
    easing: snappyOut,
  });
  const entryScale = interpolate(entryProgress, [0, 1], [1.1, 1]);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <div
        style={{
          width: "100%",
          height: "100%",
          transform: `scale(${entryScale})`,
          opacity: entryProgress,
        }}
      >
        <Img
          src={src}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: bgTransform,
          }}
        />
      </div>
      <GradientOverlay direction="bottom" opacity={0.5} />

      {/* Subtle brand watermark */}
      <div
        style={{
          position: "absolute",
          bottom: SAFE_ZONE.bottom + 20,
          left: 0,
          right: 0,
          textAlign: "center",
        }}
      >
        <span
          style={{
            fontFamily: FONTS.display,
            fontSize: FONT_SIZES.small,
            fontWeight: 800,
            color: COLORS.white,
            opacity: 0.6,
            textShadow: "0 2px 4px rgba(0,0,0,0.8)",
          }}
        >
          The Super Socializers
        </span>
      </div>
    </AbsoluteFill>
  );
};

const CTAOverlay: React.FC<{
  overlayText?: string;
  ctaText: string;
}> = ({ overlayText, ctaText }) => {
  const frame = useCurrentFrame();

  const scale = frame > 30
    ? pulseScale(frame, { startFrame: 30, pulseAmount: 0.02, speed: 3 })
    : 1;

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at center, ${COLORS.secondary}40 0%, ${COLORS.dark} 70%)`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: `${SAFE_ZONE.top}px ${SAFE_ZONE.horizontal}px ${SAFE_ZONE.bottom}px`,
        gap: 40,
      }}
    >
      {overlayText && (
        <AnimatedText
          text={overlayText}
          mode="scaleIn"
          delay={4}
          fontSize={FONT_SIZES.headline}
          fontWeight={900}
          color={COLORS.white}
          textShadow
        />
      )}
      <div style={{ transform: `scale(${scale})` }}>
        <AnimatedText
          text={ctaText}
          mode="fadeUp"
          delay={overlayText ? 16 : 4}
          fontSize={FONT_SIZES.body}
          fontWeight={800}
          color={COLORS.primary}
          textShadow
        />
      </div>
      <AnimatedText
        text="Link in bio"
        mode="fadeUp"
        delay={overlayText ? 26 : 14}
        fontSize={FONT_SIZES.small}
        fontWeight={700}
        color={COLORS.accent}
        textShadow
      />
    </AbsoluteFill>
  );
};

const PhotoDots: React.FC<{
  total: number;
  photoScenes: Array<{ start: number; end: number }>;
  frame: number;
}> = ({ total, photoScenes, frame }) => {
  // Only show during photo phase
  if (frame >= photoScenes[photoScenes.length - 1].end) return null;

  const activeIndex = photoScenes.findIndex(
    (s) => frame >= s.start && frame < s.end
  );

  return (
    <div
      style={{
        position: "absolute",
        top: SAFE_ZONE.top + 20,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        gap: 12,
        zIndex: 50,
      }}
    >
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          style={{
            width: i === activeIndex ? 32 : 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: i === activeIndex ? COLORS.primary : `${COLORS.white}60`,
            transition: "width 0.2s",
          }}
        />
      ))}
    </div>
  );
};
