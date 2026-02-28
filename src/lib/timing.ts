import { FPS } from "./constants";

/** Convert seconds to frame count */
export const sec = (s: number): number => Math.round(s * FPS);

/** Convert frames to seconds */
export const toSec = (frames: number): number => frames / FPS;

/** Scene definition with start frame, end frame, and duration */
export interface SceneDef {
  start: number;
  end: number;
  duration: number;
}

/** Build sequential scenes from an array of durations (in frames) */
export function buildScenes(durations: number[]): SceneDef[] {
  const scenes: SceneDef[] = [];
  let cursor = 0;
  for (const dur of durations) {
    scenes.push({ start: cursor, end: cursor + dur, duration: dur });
    cursor += dur;
  }
  return scenes;
}

/**
 * Build scenes that scale proportionally to fit a total frame count.
 * Pass the same durations you'd give buildScenes — they act as proportional weights.
 * The output scenes fill exactly `totalFrames`.
 */
export function buildAdaptiveScenes(
  durations: number[],
  totalFrames: number,
): SceneDef[] {
  const totalWeight = durations.reduce((s, d) => s + d, 0);
  const scenes: SceneDef[] = [];
  let cursor = 0;
  for (let i = 0; i < durations.length; i++) {
    const dur =
      i === durations.length - 1
        ? totalFrames - cursor // last scene absorbs rounding
        : Math.round((durations[i] / totalWeight) * totalFrames);
    scenes.push({ start: cursor, end: cursor + dur, duration: dur });
    cursor += dur;
  }
  return scenes;
}

/** Get the local frame within a scene (0-based). Returns -1 if outside. */
export function localFrame(globalFrame: number, scene: SceneDef): number {
  if (globalFrame < scene.start || globalFrame >= scene.end) return -1;
  return globalFrame - scene.start;
}

/** Progress through a scene (0 to 1). Clamped. */
export function sceneProgress(globalFrame: number, scene: SceneDef): number {
  const local = globalFrame - scene.start;
  return Math.max(0, Math.min(1, local / (scene.duration - 1)));
}
