import { interpolate, Easing } from "remotion";

/**
 * Screen shake effect. Returns a CSS transform string.
 * intensity = max pixel displacement, decay = how quickly it fades (0-1)
 */
export function shake(
  frame: number,
  config: {
    intensity?: number;
    speed?: number;
    decay?: number;
    startFrame?: number;
  } = {},
): string {
  const { intensity = 8, speed = 30, decay = 0.9, startFrame = 0 } = config;
  const t = frame - startFrame;
  if (t < 0) return "translate(0px, 0px)";
  const decayFactor = Math.pow(decay, t);
  const x = Math.sin(t * speed * 0.1) * intensity * decayFactor;
  const y = Math.cos(t * speed * 0.13) * intensity * 0.7 * decayFactor;
  return `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
}

/**
 * Glitch distortion effect. Returns transform + opacity + optional clipPath.
 * Uses deterministic pseudo-random based on frame for consistent renders.
 */
export function glitch(
  frame: number,
  config: { startFrame: number; duration?: number },
): { transform: string; opacity: number; clipPath?: string } {
  const { startFrame, duration = 6 } = config;
  const t = frame - startFrame;
  if (t < 0 || t >= duration) return { transform: "none", opacity: 1 };

  const progress = t / duration;
  // Deterministic pseudo-random using sine
  const offsetX = Math.sin(t * 47.3) * 20 * (1 - progress);
  const offsetY = Math.cos(t * 31.7) * 10 * (1 - progress);
  const skew = Math.sin(t * 23.1) * 5 * (1 - progress);
  // Deterministic clip insets
  const clipTop = Math.abs(Math.sin(t * 17.3)) * 40;
  const clipBottom = Math.abs(Math.cos(t * 13.7)) * 40;

  return {
    transform: `translate(${offsetX.toFixed(1)}px, ${offsetY.toFixed(1)}px) skewX(${skew.toFixed(1)}deg)`,
    opacity: 0.85 + Math.sin(t * 7.1) * 0.15,
    clipPath:
      progress < 0.7
        ? `inset(${clipTop.toFixed(0)}% 0 ${clipBottom.toFixed(0)}% 0)`
        : undefined,
  };
}

/**
 * White flash overlay. Returns opacity (0 = invisible, 1 = full white).
 * Peaks instantly then fades out.
 */
export function flash(
  frame: number,
  config: {
    startFrame: number;
    duration?: number;
    peakOpacity?: number;
  },
): number {
  const { startFrame, duration = 4, peakOpacity = 0.9 } = config;
  const t = frame - startFrame;
  if (t < 0 || t >= duration) return 0;
  return peakOpacity * Math.pow(1 - t / duration, 2);
}

/**
 * Pulse scale effect. Returns a scale value that oscillates.
 */
export function pulseScale(
  frame: number,
  config: {
    startFrame?: number;
    baseScale?: number;
    pulseAmount?: number;
    speed?: number;
  } = {},
): number {
  const {
    startFrame = 0,
    baseScale = 1,
    pulseAmount = 0.05,
    speed = 4,
  } = config;
  const t = frame - startFrame;
  if (t < 0) return baseScale;
  return baseScale + Math.sin(t * speed * 0.1) * pulseAmount;
}

/**
 * Ken Burns zoom + pan on a photo. Returns a CSS transform string.
 */
export function kenBurns(
  frame: number,
  config: {
    startFrame: number;
    duration: number;
    startScale?: number;
    endScale?: number;
    direction?:
      | "top-left"
      | "top-right"
      | "bottom-left"
      | "bottom-right"
      | "center";
  },
): string {
  const {
    startFrame,
    duration,
    startScale = 1.0,
    endScale = 1.15,
    direction = "center",
  } = config;

  const progress = interpolate(
    frame,
    [startFrame, startFrame + duration],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.quad) },
  );

  const scale = interpolate(progress, [0, 1], [startScale, endScale]);

  const panAmount = 3;
  let panX = 0;
  let panY = 0;
  switch (direction) {
    case "top-left":
      panX = panAmount;
      panY = panAmount;
      break;
    case "top-right":
      panX = -panAmount;
      panY = panAmount;
      break;
    case "bottom-left":
      panX = panAmount;
      panY = -panAmount;
      break;
    case "bottom-right":
      panX = -panAmount;
      panY = -panAmount;
      break;
    case "center":
      break;
  }

  const tx = interpolate(progress, [0, 1], [0, panX]);
  const ty = interpolate(progress, [0, 1], [0, panY]);

  return `scale(${scale.toFixed(3)}) translate(${tx.toFixed(1)}%, ${ty.toFixed(1)}%)`;
}

/**
 * Slide in/out from a direction. Returns transform + opacity.
 */
export function slideIn(
  frame: number,
  config: {
    startFrame: number;
    duration?: number;
    direction?: "left" | "right" | "up" | "down";
    distance?: number;
  },
): { transform: string; opacity: number } {
  const { startFrame, duration = 10, direction = "up", distance = 100 } = config;
  const t = frame - startFrame;
  if (t < 0) return { transform: `translate(0px, ${distance}px)`, opacity: 0 };

  const progress = interpolate(t, [0, duration], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const offset = interpolate(progress, [0, 1], [distance, 0]);
  const opacity = interpolate(progress, [0, 0.3], [0, 1], { extrapolateRight: "clamp" });

  switch (direction) {
    case "left": return { transform: `translateX(${-offset}px)`, opacity };
    case "right": return { transform: `translateX(${offset}px)`, opacity };
    case "up": return { transform: `translateY(${offset}px)`, opacity };
    case "down": return { transform: `translateY(${-offset}px)`, opacity };
  }
}

/**
 * Fade out effect. Returns opacity value.
 */
export function fadeOut(
  frame: number,
  config: { startFrame: number; duration?: number },
): number {
  const { startFrame, duration = 10 } = config;
  const t = frame - startFrame;
  if (t < 0) return 1;
  if (t >= duration) return 0;
  return interpolate(t, [0, duration], [1, 0], {
    easing: Easing.in(Easing.quad),
  });
}

/**
 * Stagger delay calculator for lists of items.
 */
export function staggerDelay(
  index: number,
  config: { baseDelay?: number; stagger?: number } = {},
): number {
  const { baseDelay = 0, stagger = 6 } = config;
  return baseDelay + index * stagger;
}

/**
 * Blur in effect. Returns a CSS filter string.
 */
export function blurIn(
  frame: number,
  config: { startFrame: number; duration?: number; maxBlur?: number },
): string {
  const { startFrame, duration = 8, maxBlur = 20 } = config;
  const t = frame - startFrame;
  if (t < 0) return `blur(${maxBlur}px)`;
  if (t >= duration) return "blur(0px)";
  const blur = interpolate(t, [0, duration], [maxBlur, 0], {
    easing: Easing.out(Easing.quad),
  });
  return `blur(${blur.toFixed(1)}px)`;
}
