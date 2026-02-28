import React from "react";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  interpolate,
  staticFile,
} from "remotion";
import { z } from "zod";
import { AnimatedText } from "../components/AnimatedText";
import { PhotoScene } from "../components/PhotoScene";
import { FlashTransition } from "../components/FlashTransition";
import { COLORS, FONT_SIZES, SAFE_ZONE } from "../lib/constants";
import { FONTS } from "../lib/fonts";
import { sec, buildScenes } from "../lib/timing";
import { snappyOut } from "../lib/easing";

export const BeforeAfterSchema = z.object({
  beforeText: z.string().default("Before: scrolling alone at midnight"),
  afterText: z.string().default("After: 10 new friends in 4 weeks"),
  revealText: z.string().default("The Super Socializers"),
  backgroundImage: z.string().optional(),
});

type Props = z.infer<typeof BeforeAfterSchema>;

export const BeforeAfter: React.FC<Props> = ({
  beforeText,
  afterText,
  revealText,
  backgroundImage,
}) => {
  const frame = useCurrentFrame();

  const beforeDur = sec(3.5);
  const transitionDur = sec(1.5);
  const afterDur = sec(4);
  const ctaDur = sec(4);

  const scenes = buildScenes([beforeDur, transitionDur, afterDur, ctaDur]);
  const [beforeScene, transScene, afterScene, ctaScene] = scenes;

  const imgSrc = backgroundImage
    ? staticFile(backgroundImage)
    : staticFile("assets/group-outdoor-1.jpg");

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.dark }}>
      {/* Scene 1: Before - dark mood */}
      <Sequence from={beforeScene.start} durationInFrames={beforeScene.duration}>
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
            text="BEFORE"
            mode="glitchIn"
            delay={4}
            fontSize={FONT_SIZES.small}
            fontWeight={800}
            color={COLORS.accent}
            textShadow
          />
          <AnimatedText
            text={beforeText}
            mode="typewriter"
            delay={12}
            fontSize={FONT_SIZES.headline}
            fontWeight={900}
            color="#888888"
            textShadow
          />
        </AbsoluteFill>
      </Sequence>

      {/* Scene 2: Swipe transition */}
      <Sequence from={transScene.start} durationInFrames={transScene.duration}>
        <SwipeDivider />
      </Sequence>

      {/* Scene 3: After - bright, energetic with photo */}
      <Sequence from={afterScene.start} durationInFrames={afterScene.duration}>
        <PhotoScene
          src={imgSrc}
          kenBurnsDirection="center"
          shakeOnEntry
          overlayOpacity={0.35}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 20,
            }}
          >
            <AnimatedText
              text="AFTER"
              mode="scaleIn"
              delay={4}
              fontSize={FONT_SIZES.small}
              fontWeight={800}
              color={COLORS.accent}
              textShadow
            />
            <AnimatedText
              text={afterText}
              mode="wordByWord"
              delay={10}
              fontSize={FONT_SIZES.headline}
              fontWeight={900}
              color={COLORS.white}
              textShadow
            />
          </div>
        </PhotoScene>
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
            text={revealText}
            mode="bounce"
            delay={4}
            fontSize={FONT_SIZES.headline}
            fontWeight={900}
            color={COLORS.primary}
            textShadow
          />
          <AnimatedText
            text="Come alone. Leave with friends."
            mode="fadeUp"
            delay={16}
            fontSize={FONT_SIZES.caption}
            fontWeight={800}
            color={COLORS.white}
            textShadow
          />
          <AnimatedText
            text="Link in bio"
            mode="fadeUp"
            delay={26}
            fontSize={FONT_SIZES.small}
            fontWeight={700}
            color={COLORS.accent}
            textShadow
          />
        </AbsoluteFill>
      </Sequence>

      {/* Transitions */}
      <FlashTransition triggerFrame={beforeScene.end - 2} color={COLORS.primary} peakOpacity={0.8} />
      <FlashTransition triggerFrame={afterScene.end - 2} />
    </AbsoluteFill>
  );
};

/** Internal swipe divider animation */
const SwipeDivider: React.FC = () => {
  const frame = useCurrentFrame();

  const progress = interpolate(frame, [0, 30], [0, 100], {
    extrapolateRight: "clamp",
    easing: snappyOut,
  });

  return (
    <AbsoluteFill>
      {/* Moving divider line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: `${progress}%`,
          width: 6,
          backgroundColor: COLORS.primary,
          boxShadow: `0 0 40px ${COLORS.primary}, 0 0 80px ${COLORS.primary}80`,
          transform: "translateX(-50%)",
        }}
      />
      {/* Left side (dark "before") */}
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          width: `${progress}%`,
          backgroundColor: COLORS.dark,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <span
          style={{
            fontFamily: FONTS.display,
            fontSize: FONT_SIZES.hookTitle,
            fontWeight: 900,
            color: "#333",
          }}
        >
          BEFORE
        </span>
      </div>
    </AbsoluteFill>
  );
};
