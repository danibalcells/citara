import { mod } from "../theory/util";
import { Mode } from "../theory/mode";
import type { Scale } from "../theory/scale";
import type { Fretboard, Position } from "./fretboard";

const NOTES_PER_STRING = 3;
const SHAPE_COUNT = 7;

/**
 * One three-note-per-string shape ("slice" of the diatonic scale).
 *
 * Named by the mode it embodies: the note your middle finger plays on the
 * lowest string, treated as a tonic, yields `mode`. The shape whose middle
 * finger lands on the scale's own root is the `isHome` shape.
 */
export type Shape = {
  index: number; // 0 = lowest on the neck; index ascends up the neck
  mode: Mode;
  rootDegree: number; // scale degree under the 6th-string middle finger (0 = root → home shape)
  isHome: boolean;
  positions: Position[];
};

/**
 * Ascending list of absolute MIDI pitches in the scale, starting at the lowest
 * note playable on the lowest string (fret 0) and climbing far enough to fill
 * every shape on every string.
 */
function scaleTones(scale: Scale, fretboard: Fretboard): number[] {
  const open = fretboard.tuning.open[0];
  const strings = fretboard.tuning.strings;
  const needed = SHAPE_COUNT + NOTES_PER_STRING * strings + 1;
  const tones: number[] = [];
  for (let pitch = open; tones.length < needed; pitch++) {
    if (scale.contains(mod(pitch, 12))) tones.push(pitch);
  }
  return tones;
}

/**
 * Generate the seven three-note-per-string shapes. Shape `k` starts on the
 * `k`-th scale tone above the lowest string, then lays three consecutive scale
 * tones on each string, continuing the ascending run across strings. Because
 * frets are derived from absolute pitch, the G→B string gap shifts the shape
 * automatically — no special case.
 *
 * Each shape's `mode` is found from its lowest-string middle-finger note
 * (the 2nd note on string 0): that note's scale degree, added to the scale's
 * own mode, gives the mode you'd be in if that note were the tonic.
 */
export function shapes(scale: Scale, fretboard: Fretboard): Shape[] {
  const tones = scaleTones(scale, fretboard);
  const { open } = fretboard.tuning;
  const strings = fretboard.tuning.strings;
  const result: Shape[] = [];

  for (let k = 0; k < SHAPE_COUNT; k++) {
    const positions: Position[] = [];
    for (let string = 0; string < strings; string++) {
      for (let n = 0; n < NOTES_PER_STRING; n++) {
        const tone = tones[k + NOTES_PER_STRING * string + n];
        const pc = mod(tone, 12);
        positions.push({
          string,
          fret: tone - open[string],
          pc,
          degree: scale.degreeOf(pc)!,
          shapes: [k],
        });
      }
    }
    const rootDegree = scale.degreeOf(mod(tones[k + 1], 12))!;
    const mode = mod(scale.mode + rootDegree, 7) as Mode;
    result.push({ index: k, mode, rootDegree, isHome: mode === scale.mode, positions });
  }
  return result;
}

/**
 * Every in-scale position on the neck, each annotated with the shape index(es)
 * it belongs to.
 *
 * Shapes repeat every octave, so each generated shape is tiled across the whole
 * neck at 12-fret intervals: a note at fret 1 carries the same shape(s) as the
 * note at fret 13. Shape indices are sorted ascending so that, in the UI, a
 * note shared by several shapes is split left→right in neck order (lower shape
 * left, higher shape right).
 */
export function annotatedPositions(scale: Scale, fretboard: Fretboard): Position[] {
  const byKey = new Map<string, Position>();

  // Seed with every in-scale note so notes outside any generated shape still appear.
  for (const p of fretboard.positions(scale)) {
    byKey.set(`${p.string}:${p.fret}`, p);
  }

  for (const shape of shapes(scale, fretboard)) {
    for (const p of shape.positions) {
      const start = ((p.fret % 12) + 12) % 12;
      for (let fret = start; fret <= fretboard.frets; fret += 12) {
        const key = `${p.string}:${fret}`;
        const existing = byKey.get(key);
        if (existing) {
          if (!existing.shapes.includes(shape.index)) existing.shapes.push(shape.index);
        } else {
          byKey.set(key, { string: p.string, fret, pc: p.pc, degree: p.degree, shapes: [shape.index] });
        }
      }
    }
  }

  const positions = [...byKey.values()];
  for (const p of positions) p.shapes.sort((a, b) => a - b);
  return positions;
}
