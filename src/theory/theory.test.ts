import { describe, expect, it } from "vitest";
import { Note } from "./note";
import { Mode, colorVsMajor, modeIntervals } from "./mode";
import { Scale } from "./scale";

describe("modes are rotations of one pattern", () => {
  it("derives the right intervals", () => {
    expect(modeIntervals(Mode.Ionian)).toEqual([0, 2, 4, 5, 7, 9, 11]);
    expect(modeIntervals(Mode.Dorian)).toEqual([0, 2, 3, 5, 7, 9, 10]);
    expect(modeIntervals(Mode.Lydian)).toEqual([0, 2, 4, 6, 7, 9, 11]);
    expect(modeIntervals(Mode.Locrian)).toEqual([0, 1, 3, 5, 6, 8, 10]);
  });

  it("derives mode color by diffing against major", () => {
    expect(colorVsMajor(Mode.Ionian)).toEqual(["1", "2", "3", "4", "5", "6", "7"]);
    expect(colorVsMajor(Mode.Dorian)).toEqual(["1", "2", "♭3", "4", "5", "6", "♭7"]);
    expect(colorVsMajor(Mode.Lydian)).toEqual(["1", "2", "3", "♯4", "5", "6", "7"]);
  });
});

describe("scale spelling: one letter per degree", () => {
  it("spells C major with all naturals", () => {
    const scale = new Scale(Note.fromName("C"), Mode.Ionian);
    expect(scale.notes().map((n) => n.name)).toEqual(["C", "D", "E", "F", "G", "A", "B"]);
  });

  it("spells F♯ major with sharps, not enharmonic flats", () => {
    const scale = new Scale(Note.fromName("F#"), Mode.Ionian);
    expect(scale.notes().map((n) => n.name)).toEqual([
      "F♯",
      "G♯",
      "A♯",
      "B",
      "C♯",
      "D♯",
      "E♯",
    ]);
  });

  it("spells A natural minor", () => {
    const scale = new Scale(Note.fromName("A"), Mode.Aeolian);
    expect(scale.notes().map((n) => n.name)).toEqual(["A", "B", "C", "D", "E", "F", "G"]);
  });
});

describe("relatives are set equality", () => {
  it("A♯ lydian shares its notes with D minor", () => {
    const lydian = new Scale(Note.fromName("A#"), Mode.Lydian);
    const dMinor = new Scale(Note.fromName("D"), Mode.Aeolian);
    expect(lydian.isRelativeOf(dMinor)).toBe(true);
  });

  it("A minor's parent major is C", () => {
    const aMinor = new Scale(Note.fromName("A"), Mode.Aeolian);
    expect(aMinor.parentMajorPc()).toBe(0); // C
  });

  it("C major and C minor are not relatives", () => {
    const cMajor = new Scale(Note.fromName("C"), Mode.Ionian);
    const cMinor = new Scale(Note.fromName("C"), Mode.Aeolian);
    expect(cMajor.isRelativeOf(cMinor)).toBe(false);
  });
});
