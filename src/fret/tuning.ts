/**
 * A tuning is just the list of open-string pitches as MIDI note numbers,
 * ordered low to high (index 0 = lowest / 6th string). Storing octave-aware
 * MIDI (not bare pitch classes) lets us derive frets directly, so the
 * G→B major-third gap on a guitar needs no special-casing.
 */
export class Tuning {
  constructor(
    readonly open: readonly number[],
    readonly name = "Custom",
  ) {}

  get strings(): number {
    return this.open.length;
  }

  // E2 A2 D3 G3 B3 E4
  static STANDARD = new Tuning([40, 45, 50, 55, 59, 64], "Standard");
}
