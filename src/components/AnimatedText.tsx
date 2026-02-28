import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig, Easing } from "remotion";
import { COLORS, FONT_SIZES } from "../lib/constants";
import { FONTS } from "../lib/fonts";
import { snappyOut, punchyOvershoot } from "../lib/easing";
import { glitch } from "../lib/effects";

export type AnimationMode =
  | "scaleIn"
  | "fadeUp"
  | "wordByWord"
  | "bounce"
  | "glitchIn"
  | "typewriter";

interface AnimatedTextProps {
  text: string;
  mode: AnimationMode;
  delay?: number;
  fontSize?: number;
  fontWeight?: 700 | 800 | 900;
  color?: string;
  accentWords?: number[];
  accentColor?: string;
  textAlign?: "center" | "left" | "right";
  lineHeight?: number;
  textShadow?: boolean;
  textOutline?: boolean;
  maxWidth?: number;
}

const SHADOW = "2px 2px 0 rgba(0,0,0,0.8), 0 4px 8px rgba(0,0,0,0.5)";
const OUTLINE_STYLE = "2px rgba(0,0,0,0.8)";

export const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  mode,
  delay = 0,
  fontSize = FONT_SIZES.headline,
  fontWeight = 900,
  color = COLORS.white,
  accentWords = [],
  accentColor = COLORS.primary,
  textAlign = "center",
  lineHeight = 1.1,
  textShadow = true,
  textOutline = false,
  maxWidth = 900,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - delay;

  const baseStyle: React.CSSProperties = {
    fontFamily: FONTS.display,
    fontSize,
    fontWeight,
    color,
    textAlign,
    lineHeight,
    maxWidth,
    textShadow: textShadow ? SHADOW : undefined,
    WebkitTextStroke: textOutline ? OUTLINE_STYLE : undefined,
    wordWrap: "break-word",
    overflowWrap: "break-word",
  };

  switch (mode) {
    case "scaleIn":
      return <ScaleIn f={f} fps={fps} style={baseStyle} text={text} accentWords={accentWords} accentColor={accentColor} />;
    case "fadeUp":
      return <FadeUp f={f} style={baseStyle} text={text} accentWords={accentWords} accentColor={accentColor} />;
    case "wordByWord":
      return <WordByWord f={f} fps={fps} style={baseStyle} text={text} accentWords={accentWords} accentColor={accentColor} />;
    case "bounce":
      return <Bounce f={f} style={baseStyle} text={text} accentWords={accentWords} accentColor={accentColor} />;
    case "glitchIn":
      return <GlitchIn f={f} style={baseStyle} text={text} accentWords={accentWords} accentColor={accentColor} />;
    case "typewriter":
      return <Typewriter f={f} style={baseStyle} text={text} accentWords={accentWords} accentColor={accentColor} />;
    default:
      return <span style={baseStyle}>{text}</span>;
  }
};

// --- Animation Implementations ---

interface ModeProps {
  f: number;
  fps?: number;
  style: React.CSSProperties;
  text: string;
  accentWords: number[];
  accentColor: string;
}

function renderWords(text: string, accentWords: number[], accentColor: string, baseColor?: string) {
  return text.split(" ").map((word, i) => (
    <span
      key={i}
      style={{
        color: accentWords.includes(i) ? accentColor : baseColor,
        display: "inline",
      }}
    >
      {word}{i < text.split(" ").length - 1 ? " " : ""}
    </span>
  ));
}

const ScaleIn: React.FC<ModeProps> = ({ f, fps, style, text, accentWords, accentColor }) => {
  if (f < 0) return null;
  const scale = spring({
    frame: f,
    fps: fps!,
    config: { damping: 12, mass: 0.8, stiffness: 200 },
  });
  const opacity = interpolate(f, [0, 6], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ ...style, transform: `scale(${scale})`, opacity }}>
      {renderWords(text, accentWords, accentColor, style.color as string)}
    </div>
  );
};

const FadeUp: React.FC<ModeProps> = ({ f, style, text, accentWords, accentColor }) => {
  if (f < 0) return null;
  const progress = interpolate(f, [0, 10], [0, 1], {
    extrapolateRight: "clamp",
    easing: snappyOut,
  });
  const translateY = interpolate(progress, [0, 1], [60, 0]);
  const opacity = progress;

  return (
    <div style={{ ...style, transform: `translateY(${translateY}px)`, opacity }}>
      {renderWords(text, accentWords, accentColor, style.color as string)}
    </div>
  );
};

const WordByWord: React.FC<ModeProps> = ({ f, fps, style, text, accentWords, accentColor }) => {
  if (f < 0) return null;
  const words = text.split(" ");
  const stagger = 4; // frames between words

  return (
    <div style={{ ...style, display: "flex", flexWrap: "wrap", justifyContent: style.textAlign === "center" ? "center" : "flex-start", gap: `0 ${(style.fontSize as number) * 0.3}px` }}>
      {words.map((word, i) => {
        const wordFrame = f - i * stagger;
        if (wordFrame < 0) return <span key={i} style={{ opacity: 0, display: "inline-block" }}>{word}</span>;

        const scale = spring({
          frame: wordFrame,
          fps: fps!,
          config: { damping: 12, mass: 0.8, stiffness: 200 },
        });
        const opacity = interpolate(wordFrame, [0, 4], [0, 1], {
          extrapolateRight: "clamp",
        });

        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              transform: `scale(${scale})`,
              opacity,
              color: accentWords.includes(i) ? accentColor : (style.color as string),
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};

const Bounce: React.FC<ModeProps> = ({ f, style, text, accentWords, accentColor }) => {
  if (f < 0) return null;
  const progress = interpolate(f, [0, 18], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.bounce),
  });
  const translateY = interpolate(progress, [0, 1], [-200, 0]);
  const scale = interpolate(f, [0, 12, 18], [0.5, 1.05, 1], {
    extrapolateRight: "clamp",
    easing: punchyOvershoot,
  });
  const opacity = interpolate(f, [0, 4], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ ...style, transform: `translateY(${translateY}px) scale(${scale})`, opacity }}>
      {renderWords(text, accentWords, accentColor, style.color as string)}
    </div>
  );
};

const GlitchIn: React.FC<ModeProps> = ({ f, style, text, accentWords, accentColor }) => {
  if (f < 0) return null;

  // Glitch for first 8 frames, then settle
  if (f < 8) {
    const g = glitch(f, { startFrame: 0, duration: 8 });
    return (
      <div style={{ position: "relative" }}>
        {/* Red channel offset */}
        <div
          style={{
            ...style,
            position: "absolute",
            color: "rgba(255,0,0,0.5)",
            transform: `translate(${Math.sin(f * 3) * 4}px, 0)`,
          }}
        >
          {text}
        </div>
        {/* Cyan channel offset */}
        <div
          style={{
            ...style,
            position: "absolute",
            color: "rgba(0,255,255,0.5)",
            transform: `translate(${Math.sin(f * 3) * -4}px, 0)`,
          }}
        >
          {text}
        </div>
        {/* Main text */}
        <div
          style={{
            ...style,
            transform: g.transform,
            opacity: g.opacity,
            clipPath: g.clipPath,
            position: "relative",
          }}
        >
          {renderWords(text, accentWords, accentColor, style.color as string)}
        </div>
      </div>
    );
  }

  return (
    <div style={style}>
      {renderWords(text, accentWords, accentColor, style.color as string)}
    </div>
  );
};

const Typewriter: React.FC<ModeProps> = ({ f, style, text, accentWords, accentColor }) => {
  if (f < 0) return null;
  const charsPerFrame = 0.5; // 2 frames per character
  const visibleChars = Math.min(Math.floor(f * charsPerFrame), text.length);
  const showCursor = f % 16 < 10; // blinking cursor

  // Reconstruct with accent words
  const fullWords = text.split(" ");
  const elements: React.ReactNode[] = [];
  let charCount = 0;

  for (let i = 0; i < fullWords.length; i++) {
    const word = fullWords[i];
    const wordStart = charCount;
    const wordEnd = charCount + word.length;

    if (wordStart >= visibleChars) break;

    const visiblePart = word.slice(0, Math.max(0, visibleChars - wordStart));
    if (visiblePart) {
      elements.push(
        <span
          key={i}
          style={{ color: accentWords.includes(i) ? accentColor : (style.color as string) }}
        >
          {visiblePart}
        </span>,
      );
    }

    // Add space if not last visible word
    if (wordEnd < visibleChars && i < fullWords.length - 1) {
      elements.push(<span key={`s${i}`}> </span>);
    }

    charCount = wordEnd + 1; // +1 for space
  }

  return (
    <div style={style}>
      {elements}
      {visibleChars < text.length && showCursor && (
        <span style={{ color: style.color, opacity: 0.8 }}>|</span>
      )}
    </div>
  );
};
