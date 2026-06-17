import { Note } from "../theory/note";
import { ALL_MODES, MODE_ALIASES, MODE_NAMES, Mode } from "../theory/mode";
import type { Shape } from "../fret/shapes";
import { MODE_COLORS } from "./colors";
import type { ColorMode, LabelMode } from "./Fretboard";

/** Curated selectable roots, one comfortable spelling per pitch class. */
export const ROOTS = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];

type Props = {
  tonicName: string;
  onTonic: (name: string) => void;
  mode: Mode;
  onMode: (mode: Mode) => void;
  colorMode: ColorMode;
  onColorMode: (m: ColorMode) => void;
  shapes: Shape[];
  enabledShapes: Set<number>;
  onToggleShape: (i: number) => void;
  onAllShapes: (on: boolean) => void;
  labelMode: LabelMode;
  onLabelMode: (m: LabelMode) => void;
};

function modeLabel(mode: Mode): string {
  const alias = MODE_ALIASES[mode];
  return alias ? `${MODE_NAMES[mode]} (${alias})` : MODE_NAMES[mode];
}

/** Short shape name: the guitarist's name where it has one (major/minor). */
function shapeLabel(mode: Mode): string {
  return MODE_ALIASES[mode] ?? MODE_NAMES[mode];
}

export function Controls(props: Props) {
  const scaleName = `${Note.fromName(props.tonicName).name} ${modeLabel(props.mode)}`;
  return (
    <div className="controls">
      <div className="row">
        <label>
          Root
          <select value={props.tonicName} onChange={(e) => props.onTonic(e.target.value)}>
            {ROOTS.map((r) => (
              <option key={r} value={r}>
                {Note.fromName(r).name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Mode
          <select value={props.mode} onChange={(e) => props.onMode(Number(e.target.value))}>
            {ALL_MODES.map((m) => (
              <option key={m} value={m}>
                {modeLabel(m)}
              </option>
            ))}
          </select>
        </label>

        <label>
          Color
          <select value={props.colorMode} onChange={(e) => props.onColorMode(e.target.value as ColorMode)}>
            <option value="all">All one color</option>
            <option value="shapes">By shape</option>
          </select>
        </label>

        <label>
          Labels
          <select value={props.labelMode} onChange={(e) => props.onLabelMode(e.target.value as LabelMode)}>
            <option value="note">Note names</option>
            <option value="degree">Scale degrees</option>
          </select>
        </label>
      </div>

      {props.colorMode === "shapes" && (
        <div className="row shapes">
          <span className="shapes-label">Shapes (low → high)</span>
          {props.shapes.map((shape) => (
            <button
              key={shape.index}
              className={`shape-toggle${props.enabledShapes.has(shape.index) ? " on" : ""}${
                shape.isHome ? " home" : ""
              }`}
              style={{ borderColor: MODE_COLORS[shape.mode] }}
              onClick={() => props.onToggleShape(shape.index)}
              title={shape.isHome ? "Home shape (root under the middle finger)" : undefined}
            >
              <span className="swatch" style={{ background: MODE_COLORS[shape.mode] }} />
              {shape.isHome && <span className="home-mark">⌂</span>}
              {shapeLabel(shape.mode)}
            </button>
          ))}
          <button className="link" onClick={() => props.onAllShapes(true)}>all</button>
          <button className="link" onClick={() => props.onAllShapes(false)}>none</button>
        </div>
      )}

      <div className="scale-name">{scaleName}</div>
    </div>
  );
}
