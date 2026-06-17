import { mod } from "../theory/util";
import type { PitchClass } from "../theory/note";
import type { Scale } from "../theory/scale";
import type { Tuning } from "./tuning";

/**
 * A single fretted note that belongs to a scale.
 *
 * `shapes` lists which three-note-per-string shapes (by index) this physical
 * position belongs to. A note shared by N shapes drives the "split dot" UI:
 * 1 shape → solid, 2+ → a pie split between the shapes' colors.
 */
export type Position = {
  string: number; // 0 = lowest string
  fret: number;
  pc: PitchClass;
  degree: number; // 0 = root
  shapes: number[];
};

export class Fretboard {
  constructor(
    readonly tuning: Tuning,
    readonly frets = 22,
  ) {}

  /** Absolute MIDI pitch at a string/fret. */
  pitchAt(string: number, fret: number): number {
    return this.tuning.open[string] + fret;
  }

  pcAt(string: number, fret: number): PitchClass {
    return mod(this.pitchAt(string, fret), 12);
  }

  /** Every in-scale note on the neck (without shape annotation). */
  positions(scale: Scale): Position[] {
    const result: Position[] = [];
    for (let string = 0; string < this.tuning.strings; string++) {
      for (let fret = 0; fret <= this.frets; fret++) {
        const pc = this.pcAt(string, fret);
        const degree = scale.degreeOf(pc);
        if (degree !== null) {
          result.push({ string, fret, pc, degree, shapes: [] });
        }
      }
    }
    return result;
  }
}
