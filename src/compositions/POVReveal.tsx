import React from "react";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  staticFile,
} from "remotion";
import { z } from "zod";
import { AnimatedText } from "../components/AnimatedText";
import { PhotoScene } from "../components/PhotoScene";
import { FlashTransition } from "../components/FlashTransition";
import { Caption } from "../components/Caption";
import { COLORS, FONT_SIZES, SAFE_ZONE } from "../lib/constants";
import { sec, buildScenes } from "../lib/timing";

export const POVRevealSchema = z.object({
  hookText: z.string().default("POV: You just moved to Bristol"),
  stages: z.array(z.string()).default([
    "Week 1: Eating alone every night",
    "Week 2: Finally show up to a walk",
    "Week 3: Speed friending night",
    "Week 4: 10 new friends, 3 group chats",
  ]),
  ctaText: z.string().default("Come alone. Leave with friends."),
  photos: z.array(z.string()).default([]),
});

type Props = z.infer<typeof POVRevealSchema>;

export const POVReveal: React.FC<Props> = ({
  hookText,
  stages,
  ctaText,
  photos,
}) => {
  const frame = useCurrentFrame();

  const hookDur = sec(2.5);
  const stageDur = sec(2);
  const ctaDur = sec(4);
  const totalStagesDur = stages.length * stageDur;

  const scenes = buildScenes([hookDur, totalStagesDur, ctaDur]);
  const [hookScene, stagesScene, ctaScene] = scenes;

  // Default photos if none provided
  const photoSrcs = photos.length > 0
    ? photos.map((p) => staticFile(p))
    : [
        staticFile("assets/group-walk-1.jpg"),
        staticFile("assets/group-outdoor-1.jpg"),
        staticFile("assets/group-activity-1.jpg"),
        staticFile("assets/hike-1.jpg"),
      ];

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.dark }}>
      {/* Scene 1: Hook */}
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
            mode="glitchIn"
            delay={4}
            fontSize={FONT_SIZES.hookTitle}
            fontWeight={900}
            color={COLORS.white}
            textShadow
          />
        </AbsoluteFill>
      </Sequence>

      {/* Scene 2: Stage reveals with photos */}
      {stages.map((stage, i) => {
        const stageStart = stagesScene.start + i * stageDur;
        const photoSrc = photoSrcs[i % photoSrcs.length];

        return (
          <Sequence key={i} from={stageStart} durationInFrames={stageDur}>
            <PhotoScene
              src={photoSrc}
              kenBurnsDirection={
                (["top-left", "top-right", "bottom-left", "bottom-right"] as const)[
                  i % 4
                ]
              }
              shakeOnEntry
              overlayOpacity={0.45}
            >
              <Caption
                text={stage}
                position="center"
                fontSize={FONT_SIZES.body}
                background
                delay={4}
              />
            </PhotoScene>
          </Sequence>
        );
      })}

      {/* Scene 3: CTA */}
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

      {/* Transitions */}
      <FlashTransition triggerFrame={hookScene.end - 2} color={COLORS.primary} />
      {stages.map((_, i) => (
        <FlashTransition
          key={i}
          triggerFrame={stagesScene.start + (i + 1) * stageDur - 2}
          peakOpacity={0.5}
        />
      ))}
    </AbsoluteFill>
  );
};
