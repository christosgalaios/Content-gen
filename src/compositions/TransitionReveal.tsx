import React from "react";
import {
  AbsoluteFill,
  Sequence,
  staticFile,
} from "remotion";
import { z } from "zod";
import { AnimatedText } from "../components/AnimatedText";
import { PhotoScene } from "../components/PhotoScene";
import { MaskReveal } from "../components/MaskReveal";
import { FlashTransition } from "../components/FlashTransition";
import { COLORS, FONT_SIZES, SAFE_ZONE } from "../lib/constants";
import { sec, buildScenes } from "../lib/timing";

export const TransitionRevealSchema = z.object({
  hookText: z.string().default("What if we told you..."),
  revealText: z.string().default("2,900+ people found their crew here"),
  backgroundImage: z.string().optional(),
});

type Props = z.infer<typeof TransitionRevealSchema>;

export const TransitionReveal: React.FC<Props> = ({
  hookText,
  revealText,
  backgroundImage,
}) => {
  const hookDur = sec(3);
  const revealDur = sec(4);
  const textDur = sec(3);
  const ctaDur = sec(4);

  const scenes = buildScenes([hookDur, revealDur, textDur, ctaDur]);
  const [hookScene, revealScene, textScene, ctaScene] = scenes;

  const imgSrc = backgroundImage
    ? staticFile(backgroundImage)
    : staticFile("assets/group-outdoor-1.jpg");

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.dark }}>
      {/* Scene 1: Hook text on dark background */}
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
            text={hookText}
            mode="typewriter"
            delay={6}
            fontSize={FONT_SIZES.hookTitle}
            fontWeight={900}
            color={COLORS.white}
            textShadow
          />
        </AbsoluteFill>
      </Sequence>

      {/* Scene 2: Circle mask reveals photo */}
      <Sequence from={revealScene.start} durationInFrames={revealScene.duration}>
        <MaskReveal delay={4} duration={25} shape="circle">
          <PhotoScene
            src={imgSrc}
            kenBurnsDirection="center"
            overlayOpacity={0.3}
          />
        </MaskReveal>
      </Sequence>

      {/* Scene 3: Text overlay on revealed photo */}
      <Sequence from={textScene.start} durationInFrames={textScene.duration}>
        <PhotoScene
          src={imgSrc}
          kenBurnsDirection="bottom-right"
          overlayOpacity={0.45}
        >
          <AnimatedText
            text={revealText}
            mode="wordByWord"
            delay={6}
            fontSize={FONT_SIZES.headline}
            fontWeight={900}
            color={COLORS.white}
            textShadow
          />
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
            text="Come alone. Leave with friends."
            mode="scaleIn"
            delay={4}
            fontSize={FONT_SIZES.headline}
            fontWeight={900}
            color={COLORS.white}
            textShadow
          />
          <AnimatedText
            text="Link in bio"
            mode="fadeUp"
            delay={18}
            fontSize={FONT_SIZES.small}
            fontWeight={700}
            color={COLORS.accent}
            textShadow
          />
        </AbsoluteFill>
      </Sequence>

      <FlashTransition triggerFrame={hookScene.end - 2} color={COLORS.primary} peakOpacity={0.7} />
      <FlashTransition triggerFrame={revealScene.end - 2} peakOpacity={0.4} />
      <FlashTransition triggerFrame={textScene.end - 2} />
    </AbsoluteFill>
  );
};
