import { mod } from "./util";

/** A pitch class: an integer in [0, 12), with C = 0. */
export type PitchClass = number;

/** A signed interval in semitones. */
export type Semitones = number;

/** Letter names indexed 0..6 = A..G. */
export const LETTERS = ["A", "B", "C", "D", "E", "F", "G"] as const;

/** Natural pitch class of each letter (A=9, B=11, C=0, ...). */
export const LETTER_PC: readonly PitchClass[] = [9, 11, 0, 2, 4, 5, 7];

const SHARP = "♯"; // ♯
const FLAT = "♭"; // ♭

function accidentalToString(accidental: number): string {
  if (accidental > 0) return SHARP.repeat(accidental);
  if (accidental < 0) return FLAT.repeat(-accidental);
  return "";
}

/**
 * A note spelled as a letter (A..G) plus an accidental in semitones
 * (negative = flats, positive = sharps). This keeps enharmonic spelling
 * explicit: A♯ and B♭ are distinct Notes with the same pitch class.
 */
export class Note {
  constructor(
    readonly letter: number,
    readonly accidental: number,
  ) {}

  get pitchClass(): PitchClass {
    return mod(LETTER_PC[this.letter] + this.accidental, 12);
  }

  get name(): string {
    return LETTERS[this.letter] + accidentalToString(this.accidental);
  }

  /** Parse a name like "C", "F#", "Bb", "A##". */
  static fromName(name: string): Note {
    const letter = LETTERS.indexOf(name[0]?.toUpperCase() as (typeof LETTERS)[number]);
    if (letter < 0) throw new Error(`Invalid note name: ${name}`);
    let accidental = 0;
    for (const ch of name.slice(1)) {
      if (ch === "#" || ch === SHARP) accidental += 1;
      else if (ch === "b" || ch === FLAT) accidental -= 1;
      else throw new Error(`Invalid accidental in: ${name}`);
    }
    return new Note(letter, accidental);
  }

  equals(other: Note): boolean {
    return this.letter === other.letter && this.accidental === other.accidental;
  }
}
