import React from "react";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
} from "remotion";
import { z } from "zod";
import { AnimatedText } from "../components/AnimatedText";
import { NumberedList } from "../components/NumberedList";
import { FlashTransition } from "../components/FlashTransition";
import { COLORS, FONT_SIZES, SAFE_ZONE } from "../lib/constants";
import { sec, buildScenes } from "../lib/timing";
import { pulseScale } from "../lib/effects";

export const ListCountdownSchema = z.object({
  title: z.string().default("5 reasons to join The Super Socializers"),
  items: z.array(z.string()).default([
    "90% of people come alone",
    "500+ events hosted since 2023",
    "Hikes, pubs, games, festivals",
    "Strictly platonic, zero drama",
    "Bristol's friendliest community",
  ]),
  ctaText: z.string().default("Your next adventure starts here"),
});

type Props = z.infer<typeof ListCountdownSchema>;

export const ListCountdown: React.FC<Props> = ({
  title,
  items,
  ctaText,
}) => {
  const frame = useCurrentFrame();

  const hookDur = sec(2.5);
  const listDur = sec(1.8) * items.length + sec(1);
  const ctaDur = sec(4);

  const scenes = buildScenes([hookDur, listDur, ctaDur]);
  const [hookScene, listScene, ctaScene] = scenes;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.dark }}>
      {/* Animated background */}
      <AnimatedListBackground frame={frame} />

      {/* Scene 1: Title hook */}
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
            mode="scaleIn"
            delay={4}
            fontSize={FONT_SIZES.headline}
            fontWeight={900}
            color={COLORS.white}
            textShadow
          />
        </AbsoluteFill>
      </Sequence>

      {/* Scene 2: Numbered list */}
      <Sequence from={listScene.start} durationInFrames={listScene.duration}>
        <AbsoluteFill
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <NumberedList
            items={items}
            staggerFrames={sec(1.8)}
          />
        </AbsoluteFill>
      </Sequence>

      {/* Scene 3: CTA */}
      <Sequence from={ctaScene.start} durationInFrames={ctaScene.duration}>
        <CTASection ctaText={ctaText} />
      </Sequence>

      {/* Transitions */}
      <FlashTransition triggerFrame={hookScene.end - 2} color={COLORS.primary} peakOpacity={0.5} />
      <FlashTransition triggerFrame={listScene.end - 2} />
    </AbsoluteFill>
  );
};

const AnimatedListBackground: React.FC<{ frame: number }> = ({ frame }) => {
  return (
    <AbsoluteFill
      style={{
        background: `
          radial-gradient(ellipse at 20% 30%, ${COLORS.secondary}25 0%, transparent 50%),
          radial-gradient(ellipse at 80% 70%, ${COLORS.primary}15 0%, transparent 50%),
          ${COLORS.dark}
        `,
      }}
    />
  );
};

const CTASection: React.FC<{ ctaText: string }> = ({ ctaText }) => {
  const frame = useCurrentFrame();
  const scale = frame > 20
    ? pulseScale(frame, { startFrame: 20, pulseAmount: 0.03, speed: 3 })
    : 1;

  return (
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
      <div style={{ transform: `scale(${scale})` }}>
        <AnimatedText
          text={ctaText}
          mode="scaleIn"
          delay={4}
          fontSize={FONT_SIZES.headline}
          fontWeight={900}
          color={COLORS.primary}
          textShadow
        />
      </div>
      <AnimatedText
        text="Join 2,900+ members on Meetup"
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
        delay={24}
        fontSize={FONT_SIZES.small}
        fontWeight={700}
        color={COLORS.accent}
        textShadow
      />
    </AbsoluteFill>
  );
};
