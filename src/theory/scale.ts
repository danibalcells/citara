import { mod } from "./util";
import { LETTER_PC, Note } from "./note";
import type { PitchClass } from "./note";
import { Mode, modeIntervals } from "./mode";

/**
 * A scale = a tonic note + a mode. Everything (notes, pitch classes, degrees,
 * relatives) is derived on demand from the mode's intervals, so a Scale stores
 * only its two defining facts.
 */
export class Scale {
  constructor(
    readonly tonic: Note,
    readonly mode: Mode,
  ) {}

  /** Intervals of each degree above the tonic, in semitones. */
  intervals(): number[] {
    return modeIntervals(this.mode);
  }

  /**
   * The seven notes, spelled one per letter. Because a diatonic scale uses each
   * letter A–G exactly once, we assign consecutive letters to consecutive
   * degrees and compute the accidental that lands on the target pitch class —
   * this makes enharmonic spelling self-correcting (F♯ major, not G♭ major).
   */
  notes(): Note[] {
    const tonicPc = this.tonic.pitchClass;
    return this.intervals().map((interval, degree) => {
      const letter = mod(this.tonic.letter + degree, 7);
      const targetPc = mod(tonicPc + interval, 12);
      let accidental = mod(targetPc - LETTER_PC[letter], 12);
      if (accidental > 6) accidental -= 12; // prefer flats over far-sharps
      return new Note(letter, accidental);
    });
  }

  /** The set of pitch classes in the scale. */
  pcSet(): Set<PitchClass> {
    const tonicPc = this.tonic.pitchClass;
    return new Set(this.intervals().map((i) => mod(tonicPc + i, 12)));
  }

  contains(pc: PitchClass): boolean {
    return this.pcSet().has(mod(pc, 12));
  }

  /** Scale degree (0 = tonic) of a pitch class, or null if not in the scale. */
  degreeOf(pc: PitchClass): number | null {
    const target = mod(pc - this.tonic.pitchClass, 12);
    const idx = this.intervals().indexOf(target);
    return idx === -1 ? null : idx;
  }

  /** Pitch class of the parent major scale (the Ionian sharing these notes). */
  parentMajorPc(): PitchClass {
    return mod(this.tonic.pitchClass - modeIntervals(Mode.Ionian)[this.mode], 12);
  }

  /** True iff two scales contain the same set of pitch classes. */
  isRelativeOf(other: Scale): boolean {
    const a = this.pcSet();
    const b = other.pcSet();
    if (a.size !== b.size) return false;
    for (const pc of a) if (!b.has(pc)) return false;
    return true;
  }
}
