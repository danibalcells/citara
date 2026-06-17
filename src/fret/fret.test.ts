import { describe, expect, it } from "vitest";
import { Note } from "../theory/note";
import { Mode } from "../theory/mode";
import { Scale } from "../theory/scale";
import { Fretboard } from "./fretboard";
import { Tuning } from "./tuning";
import { annotatedPositions, shapes } from "./shapes";

const fretboard = new Fretboard(Tuning.STANDARD, 22);

describe("fretboard pitch mapping", () => {
  it("computes correct pitch classes, including the B-string gap", () => {
    // Open strings low→high: E A D G B E
    expect([0, 1, 2, 3, 4, 5].map((s) => fretboard.pcAt(s, 0))).toEqual([4, 9, 2, 7, 11, 4]);
  });
});

describe("three-note-per-string shapes", () => {
  const aMinor = new Scale(Note.fromName("A"), Mode.Aeolian);

  it("reproduces Toño's minor shape exactly (the A minor tab from the note)", () => {
    // The minor (Aeolian) shape: middle finger plays the root A on the 6th string.
    const shape = shapes(aMinor, fretboard).find((s) => s.mode === Mode.Aeolian)!;
    const fretsByString = [0, 1, 2, 3, 4, 5].map((s) =>
      shape.positions.filter((p) => p.string === s).map((p) => p.fret),
    );
    expect(fretsByString).toEqual([
      [3, 5, 7], // low E
      [3, 5, 7], // A
      [3, 5, 7], // D
      [4, 5, 7], // G
      [5, 6, 8], // B  ← the major-third gap shifts the shape automatically
      [5, 7, 8], // high E
    ]);
  });

  it("has three notes per string in every shape", () => {
    for (const shape of shapes(aMinor, fretboard)) {
      for (let s = 0; s < 6; s++) {
        expect(shape.positions.filter((p) => p.string === s)).toHaveLength(3);
      }
    }
  });

  it("names shapes by mode, with exactly one home shape on the root", () => {
    const list = shapes(aMinor, fretboard);
    const home = list.filter((s) => s.isHome);
    expect(home).toHaveLength(1);
    expect(home[0].mode).toBe(Mode.Aeolian);
    // The home shape's middle finger plays the root (A, fret 5) on the low E string.
    const lowE = home[0].positions.filter((p) => p.string === 0).sort((a, b) => a.fret - b.fret);
    expect(lowE[1].fret).toBe(5);
    expect(lowE[1].degree).toBe(0);
  });

  it("orders shapes up the neck in +1 mode steps (minor below locrian below major)", () => {
    const modes = shapes(aMinor, fretboard).map((s) => s.mode);
    const minor = modes.indexOf(Mode.Aeolian);
    expect(modes[minor + 1]).toBe(Mode.Locrian);
    expect(modes[minor + 2]).toBe(Mode.Ionian);
  });

  it("annotates shared notes with multiple shapes (the overlap)", () => {
    const positions = annotatedPositions(aMinor, fretboard);
    const shared = positions.filter((p) => p.shapes.length >= 2);
    expect(shared.length).toBeGreaterThan(0);
    // No physical note can belong to more shapes than overlap allows.
    expect(Math.max(...positions.map((p) => p.shapes.length))).toBeLessThanOrEqual(3);
  });

  it("wraps shapes around the 12th fret (same shapes 12 frets apart)", () => {
    const positions = annotatedPositions(aMinor, fretboard);
    const at = (string: number, fret: number) =>
      positions.find((p) => p.string === string && p.fret === fret);
    for (let string = 0; string < 6; string++) {
      for (let fret = 0; fret <= 9; fret++) {
        const low = at(string, fret);
        const high = at(string, fret + 12);
        if (low && high) expect(high.shapes).toEqual(low.shapes);
      }
    }
  });

  it("marks roots as degree 0", () => {
    const positions = annotatedPositions(aMinor, fretboard);
    const roots = positions.filter((p) => p.degree === 0);
    // Open A string (string 1, fret 0) is a root.
    expect(roots.some((p) => p.string === 1 && p.fret === 0)).toBe(true);
  });
});
