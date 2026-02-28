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
import { Badge } from "../components/Badge";
import { COLORS, FONT_SIZES, SAFE_ZONE } from "../lib/constants";
import { FONTS } from "../lib/fonts";
import { kenBurns, pulseScale, fadeOut } from "../lib/effects";
import { sec, buildAdaptiveScenes } from "../lib/timing";
import { snappyOut } from "../lib/easing";

export const EventPromoSchema = z.object({
  durationInSeconds: z.number().optional(),
  eventName: z.string(),
  eventDate: z.string(),
  eventTime: z.string(),
  eventLocation: z.string(),
  eventType: z.string().default("Social"),
  backgroundImage: z.string().optional(),
  memberCount: z.string().default("2,900+"),
});

type Props = z.infer<typeof EventPromoSchema>;

export const EventPromo: React.FC<Props> = ({
  eventName,
  eventDate,
  eventTime,
  eventLocation,
  eventType,
  backgroundImage,
  memberCount,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();
  const isVertical = height > width;

  // Scene layout: hook → details → social proof → CTA (proportional to total duration)
  const scenes = buildAdaptiveScenes([sec(2.5), sec(4), sec(3.5), sec(5)], durationInFrames);
  const [hookScene, detailScene, proofScene, ctaScene] = scenes;

  const bgSrc = backgroundImage || staticFile("assets/group-outdoor-1.jpg");

  // Background Ken Burns across full video
  const bgTransform = kenBurns(frame, {
    startFrame: 0,
    duration: durationInFrames,
    startScale: 1.05,
    endScale: 1.25,
    direction: "bottom-right",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.dark }}>
      {/* Background photo */}
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <Img
          src={bgSrc}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: bgTransform,
          }}
        />
        <GradientOverlay direction="full" opacity={0.5} />
        <GradientOverlay direction="bottom" opacity={0.8} />
      </AbsoluteFill>

      {/* Scene 1: Hook — Event type badge + name */}
      <Sequence from={hookScene.start} durationInFrames={hookScene.duration}>
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: `${SAFE_ZONE.top}px ${SAFE_ZONE.horizontal}px ${SAFE_ZONE.bottom}px`,
          }}
        >
          <Badge text={eventType} delay={4} color={COLORS.dark} backgroundColor={COLORS.accent} />
          <div style={{ marginTop: 40 }}>
            <AnimatedText
              text={eventName}
              mode="scaleIn"
              delay={10}
              fontSize={isVertical ? FONT_SIZES.hookTitle : FONT_SIZES.headline}
              fontWeight={900}
              color={COLORS.white}
              textShadow
            />
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 2: Event details */}
      <Sequence from={detailScene.start} durationInFrames={detailScene.duration}>
        <DetailSlide
          date={eventDate}
          time={eventTime}
          location={eventLocation}
        />
      </Sequence>

      {/* Scene 3: Social proof */}
      <Sequence from={proofScene.start} durationInFrames={proofScene.duration}>
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
            text="90% come alone"
            mode="glitchIn"
            delay={2}
            fontSize={FONT_SIZES.headline}
            fontWeight={900}
            color={COLORS.primary}
            textShadow
          />
          <AnimatedText
            text="That's totally normal."
            mode="fadeUp"
            delay={18}
            fontSize={FONT_SIZES.body}
            fontWeight={700}
            color={COLORS.white}
            textShadow
          />
          <div style={{ marginTop: 20 }}>
            <AnimatedText
              text={`${memberCount} members & counting`}
              mode="fadeUp"
              delay={30}
              fontSize={FONT_SIZES.caption}
              fontWeight={700}
              color={COLORS.accent}
              textShadow
            />
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 4: CTA */}
      <Sequence from={ctaScene.start} durationInFrames={ctaScene.duration}>
        <CTASlide />
      </Sequence>

      {/* Flash transitions between scenes */}
      <FlashTransition triggerFrame={hookScene.end - 2} />
      <FlashTransition triggerFrame={detailScene.end - 2} />
      <FlashTransition triggerFrame={proofScene.end - 2} />
    </AbsoluteFill>
  );
};

const DetailSlide: React.FC<{ date: string; time: string; location: string }> = ({
  date,
  time,
  location,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const items = [
    { icon: "\u{1F4C5}", text: date },
    { icon: "\u{1F553}", text: time },
    { icon: "\u{1F4CD}", text: location },
  ];

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: `${SAFE_ZONE.top}px ${SAFE_ZONE.horizontal + 40}px ${SAFE_ZONE.bottom}px`,
        gap: 50,
      }}
    >
      {items.map((item, i) => {
        const delay = 4 + i * 8;
        const f = frame - delay;
        if (f < 0) return <div key={i} style={{ opacity: 0, height: 80 }} />;

        const progress = interpolate(f, [0, 10], [0, 1], {
          extrapolateRight: "clamp",
          easing: snappyOut,
        });
        const translateX = interpolate(progress, [0, 1], [-80, 0]);

        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 28,
              opacity: progress,
              transform: `translateX(${translateX}px)`,
            }}
          >
            <span style={{ fontSize: 56 }}>{item.icon}</span>
            <span
              style={{
                fontFamily: FONTS.display,
                fontSize: FONT_SIZES.body,
                fontWeight: 800,
                color: COLORS.white,
                textShadow: "2px 2px 0 rgba(0,0,0,0.8)",
              }}
            >
              {item.text}
            </span>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const CTASlide: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = frame > 30
    ? pulseScale(frame, { startFrame: 30, pulseAmount: 0.02, speed: 3 })
    : 1;

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: `${SAFE_ZONE.top}px ${SAFE_ZONE.horizontal}px ${SAFE_ZONE.bottom}px`,
        gap: 40,
      }}
    >
      <div style={{ transform: `scale(${scale})` }}>
        <AnimatedText
          text="Come alone."
          mode="scaleIn"
          delay={4}
          fontSize={FONT_SIZES.hookTitle}
          fontWeight={900}
          color={COLORS.white}
          textShadow
        />
      </div>
      <AnimatedText
        text="Leave with friends."
        mode="fadeUp"
        delay={16}
        fontSize={FONT_SIZES.hookTitle}
        fontWeight={900}
        color={COLORS.primary}
        textShadow
      />
      <div style={{ marginTop: 30 }}>
        <AnimatedText
          text="Link in bio"
          mode="fadeUp"
          delay={28}
          fontSize={FONT_SIZES.caption}
          fontWeight={700}
          color={COLORS.accent}
          textShadow
        />
      </div>
    </AbsoluteFill>
  );
};
