import React from "react";
import {
  AbsoluteFill,
  Sequence,
  staticFile,
} from "remotion";
import { z } from "zod";
import { PhotoScene } from "../components/PhotoScene";
import { TikTokCaption } from "../components/TikTokCaption";
import { AnimatedText } from "../components/AnimatedText";
import { FlashTransition } from "../components/FlashTransition";
import { COLORS, FONT_SIZES, SAFE_ZONE } from "../lib/constants";
import { sec, buildScenes } from "../lib/timing";

export const StoryTimeSchema = z.object({
  durationInSeconds: z.number().optional(),
  storyText: z
    .string()
    .default(
      "I moved to Bristol knowing literally nobody. Spent two weeks eating alone. Then I found this group on Meetup. First event I almost didn't go. But I did. Best decision ever."
    ),
  backgroundImage: z.string().optional(),
});

type Props = z.infer<typeof StoryTimeSchema>;

export const StoryTime: React.FC<Props> = ({
  storyText,
  backgroundImage,
}) => {
  const imgSrc = backgroundImage
    ? staticFile(backgroundImage)
    : staticFile("assets/group-outdoor-1.jpg");

  // Calculate duration based on word count
  const words = storyText.split(/\s+/);
  const wordsPerGroup = 3;
  const groups = Math.ceil(words.length / wordsPerGroup);
  const captionDur = groups * 18 + 10; // 18 frames per group + padding
  const ctaDur = sec(3.5);

  const scenes = buildScenes([captionDur, ctaDur]);
  const [captionScene, ctaScene] = scenes;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.dark }}>
      {/* Full-screen photo background for entire video */}
      <PhotoScene
        src={imgSrc}
        kenBurnsDirection="center"
        startScale={1.0}
        endScale={1.2}
        overlayOpacity={0.5}
      />

      {/* Scene 1: Animated captions */}
      <Sequence from={captionScene.start} durationInFrames={captionScene.duration}>
        <TikTokCaption
          text={storyText}
          wordsPerGroup={wordsPerGroup}
          position="center"
          startFrame={6}
        />
      </Sequence>

      {/* Scene 2: CTA */}
      <Sequence from={ctaScene.start} durationInFrames={ctaScene.duration}>
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: `${SAFE_ZONE.top}px ${SAFE_ZONE.horizontal}px ${SAFE_ZONE.bottom}px`,
            gap: 24,
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
            delay={16}
            fontSize={FONT_SIZES.small}
            fontWeight={700}
            color={COLORS.accent}
            textShadow
          />
        </AbsoluteFill>
      </Sequence>

      <FlashTransition triggerFrame={captionScene.end - 2} />
    </AbsoluteFill>
  );
};
