import { Easing } from "remotion";

/** Snappy ease-out: fast start, smooth stop. For text appearing. */
export const snappyOut = Easing.bezier(0.16, 1, 0.3, 1);

/** Punchy overshoot: slight bounce past target. For scale-in effects. */
export const punchyOvershoot = Easing.bezier(0.34, 1.56, 0.64, 1);

/** Sharp ease-in: smooth start, sudden stop. For exits. */
export const sharpIn = Easing.bezier(0.55, 0, 1, 0.45);

/** Elastic snap: big overshoot + settle. For attention-grabbing text. */
export const elasticSnap = Easing.out(Easing.elastic(1.5));

/** Smooth decelerate: gentle ease-out for Ken Burns pans. */
export const smoothDecel = Easing.out(Easing.quad);

/** Bounce settle: for final CTA appearance. */
export const bounceSettle = Easing.out(Easing.bounce);
