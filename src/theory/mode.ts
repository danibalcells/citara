import { rotate } from "./util";
import type { Semitones } from "./note";

/**
 * The single source of truth for the diatonic scale: the semitone steps of the
 * major scale (W W H W W W H). Every mode is a rotation of this array, and
 * every interval, color, and fretboard shape is derived from it — nothing else
 * about the seven modes is hard-coded.
 */
export const MAJOR_STEPS: readonly Semitones[] = [2, 2, 1, 2, 2, 2, 1];

export enum Mode {
  Ionian = 0,
  Dorian = 1,
  Phrygian = 2,
  Lydian = 3,
  Mixolydian = 4,
  Aeolian = 5,
  Locrian = 6,
}

export const MODE_NAMES: readonly string[] = [
  "Ionian",
  "Dorian",
  "Phrygian",
  "Lydian",
  "Mixolydian",
  "Aeolian",
  "Locrian",
];

/** Common aliases for the two modes guitarists name by feel. */
export const MODE_ALIASES: Readonly<Partial<Record<Mode, string>>> = {
  [Mode.Ionian]: "major",
  [Mode.Aeolian]: "minor",
};

export const ALL_MODES: readonly Mode[] = [0, 1, 2, 3, 4, 5, 6];

/** The semitone step pattern of a mode = the major pattern rotated. */
export function modeSteps(mode: Mode): Semitones[] {
  return rotate(MAJOR_STEPS, mode);
}

/**
 * Intervals (in semitones) of each scale degree above the tonic.
 * Seven entries; the first is always 0.
 */
export function modeIntervals(mode: Mode): Semitones[] {
  const steps = modeSteps(mode);
  const intervals: Semitones[] = [0];
  for (let i = 0; i < steps.length - 1; i++) {
    intervals.push(intervals[i] + steps[i]);
  }
  return intervals;
}

/**
 * The "color" of a mode relative to the major scale: a degree label per scale
 * tone, e.g. Dorian → ["1","2","♭3","4","5","6","♭7"]. Derived by diffing the
 * mode's intervals against Ionian's, so no per-mode table is needed.
 */
export function colorVsMajor(mode: Mode): string[] {
  const ref = modeIntervals(Mode.Ionian);
  return modeIntervals(mode).map((interval, degree) => {
    const diff = interval - ref[degree];
    const accidental = diff > 0 ? "♯".repeat(diff) : "♭".repeat(-diff);
    return accidental + (degree + 1);
  });
}
