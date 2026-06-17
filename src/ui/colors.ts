import { Mode } from "../theory/mode";

/**
 * A fixed color per mode, so a shape keeps its color across roots and scales
 * (the minor shape is always dark blue, Lydian always yellow, ...).
 */
export const MODE_COLORS: Record<Mode, string> = {
  [Mode.Ionian]: "#3cb44b", // major — green
  [Mode.Dorian]: "#f58231", // orange
  [Mode.Phrygian]: "#911eb4", // purple
  [Mode.Lydian]: "#ffe119", // yellow
  [Mode.Mixolydian]: "#42d4f4", // light blue
  [Mode.Aeolian]: "#1b3fa0", // minor — dark blue
  [Mode.Locrian]: "#e6194b", // red
};

/** Accent used in uniform ("all notes") mode. */
export const UNIFORM_COLOR = "#4363d8";

export const ROOT_RING = "#1a1a1a";
