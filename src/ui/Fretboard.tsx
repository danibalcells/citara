import { useMemo } from "react";
import { Scale } from "../theory/scale";
import { colorVsMajor } from "../theory/mode";
import { Fretboard as FretboardModel, Position } from "../fret/fretboard";
import { annotatedPositions, type Shape } from "../fret/shapes";
import { MODE_COLORS, ROOT_RING, UNIFORM_COLOR } from "./colors";

export type ColorMode = "all" | "shapes";
export type LabelMode = "note" | "degree";

type Props = {
  scale: Scale;
  fretboard: FretboardModel;
  displayFrets: number;
  colorMode: ColorMode;
  shapes: Shape[];
  enabledShapes: Set<number>;
  labelMode: LabelMode;
  homeShape: number;
};

const STRING_H = 38;
const FRET_W = 62;
const PAD_LEFT = 64; // open-note column + nut
const PAD_TOP = 34;
const PAD_BOTTOM = 28;
const PAD_RIGHT = 24;
const DOT_R = 14;
const MARKER_FRETS = [3, 5, 7, 9, 15, 17, 19, 21];
const STRING_LABELS = ["E", "A", "D", "G", "B", "e"]; // index 0 = low E

/**
 * A dot split into equal vertical bands, left→right, one per color. The colors
 * arrive in neck order (lowest shape first), so the shape below sits on the
 * left, the current shape in the middle, and the shape above on the right.
 * A single color renders as a plain circle.
 */
function SplitDot({
  id,
  cx,
  cy,
  r,
  colors,
}: {
  id: string;
  cx: number;
  cy: number;
  r: number;
  colors: string[];
}) {
  if (colors.length === 1) {
    return <circle cx={cx} cy={cy} r={r} fill={colors[0]} />;
  }
  const bandW = (2 * r) / colors.length;
  const clipId = `clip-${id}`;
  return (
    <g>
      <clipPath id={clipId}>
        <circle cx={cx} cy={cy} r={r} />
      </clipPath>
      <g clipPath={`url(#${clipId})`}>
        {colors.map((color, i) => (
          <rect key={i} x={cx - r + i * bandW} y={cy - r} width={bandW} height={2 * r} fill={color} />
        ))}
      </g>
    </g>
  );
}

export function Fretboard({
  scale,
  fretboard,
  displayFrets,
  colorMode,
  shapes,
  enabledShapes,
  labelMode,
  homeShape,
}: Props) {
  const positions = useMemo(
    () => annotatedPositions(scale, fretboard),
    [scale, fretboard],
  );
  const degreeLabels = useMemo(() => {
    const labels = colorVsMajor(scale.mode);
    labels[0] = "R";
    return labels;
  }, [scale]);

  const strings = fretboard.tuning.strings;
  const width = PAD_LEFT + displayFrets * FRET_W + PAD_RIGHT;
  const height = PAD_TOP + (strings - 1) * STRING_H + PAD_BOTTOM;

  const stringY = (s: number) => PAD_TOP + (strings - 1 - s) * STRING_H;
  const fretWireX = (f: number) => PAD_LEFT + f * FRET_W;
  const dotX = (f: number) => (f === 0 ? PAD_LEFT - FRET_W * 0.5 : PAD_LEFT + (f - 0.5) * FRET_W);

  const modeByShape = useMemo(() => new Map(shapes.map((s) => [s.index, s.mode])), [shapes]);
  const rootDegreeByShape = useMemo(
    () => new Map(shapes.map((s) => [s.index, s.rootDegree])),
    [shapes],
  );
  // Selection is keyed by root-relative degree so it tracks the root across mode changes.
  const isEnabled = (k: number) => enabledShapes.has(rootDegreeByShape.get(k)!);

  const visibleColors = (p: Position): string[] => {
    if (colorMode === "all") return [UNIFORM_COLOR];
    return p.shapes.filter(isEnabled).map((s) => MODE_COLORS[modeByShape.get(s)!]);
  };

  const visible = positions.filter(
    (p) => p.fret <= displayFrets && visibleColors(p).length > 0,
  );

  return (
    <svg
      className="fretboard"
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      role="img"
      aria-label={`${scale.tonic.name} ${scale.mode} fretboard`}
    >
      {/* inlay markers */}
      {MARKER_FRETS.filter((f) => f <= displayFrets).map((f) => (
        <circle key={`m${f}`} cx={dotX(f)} cy={height / 2} r={4} fill="#cdb892" />
      ))}
      {displayFrets >= 12 && (
        <>
          <circle cx={dotX(12)} cy={stringY(strings - 1) + STRING_H * 0.5} r={4} fill="#cdb892" />
          <circle cx={dotX(12)} cy={stringY(0) - STRING_H * 0.5} r={4} fill="#cdb892" />
        </>
      )}

      {/* strings */}
      {Array.from({ length: strings }, (_, s) => (
        <line
          key={`s${s}`}
          x1={PAD_LEFT}
          y1={stringY(s)}
          x2={width - PAD_RIGHT}
          y2={stringY(s)}
          stroke="#888"
          strokeWidth={0.5 + s * 0.35}
        />
      ))}

      {/* frets (fret 0 = nut, drawn thick) */}
      {Array.from({ length: displayFrets + 1 }, (_, f) => (
        <line
          key={`f${f}`}
          x1={fretWireX(f)}
          y1={stringY(strings - 1)}
          x2={fretWireX(f)}
          y2={stringY(0)}
          stroke={f === 0 ? "#222" : "#bbb"}
          strokeWidth={f === 0 ? 5 : 2}
        />
      ))}

      {/* fret numbers */}
      {Array.from({ length: displayFrets + 1 }, (_, f) => (
        <text key={`n${f}`} x={dotX(f)} y={16} textAnchor="middle" className="fret-num">
          {f}
        </text>
      ))}

      {/* string labels */}
      {Array.from({ length: strings }, (_, s) => (
        <text key={`l${s}`} x={10} y={stringY(s) + 4} className="string-label">
          {STRING_LABELS[s] ?? s}
        </text>
      ))}

      {/* notes */}
      {visible.map((p) => {
        const colors = visibleColors(p);
        const cx = dotX(p.fret);
        const cy = stringY(p.string);
        const isRoot = p.degree === 0;
        const inHome =
          colorMode === "shapes" && isEnabled(homeShape) && p.shapes.includes(homeShape);
        const label = labelMode === "note"
          ? noteNameAt(scale, p.pc)
          : degreeLabels[p.degree];
        return (
          <g key={`${p.string}:${p.fret}`}>
            <SplitDot id={`${p.string}-${p.fret}`} cx={cx} cy={cy} r={DOT_R} colors={colors} />
            {/* home shape gets a thick outline so it stands out from its neighbours */}
            {inHome && (
              <circle cx={cx} cy={cy} r={DOT_R} fill="none" stroke={ROOT_RING} strokeWidth={3} />
            )}
            {isRoot && (
              <circle cx={cx} cy={cy} r={DOT_R + 3.5} fill="none" stroke={ROOT_RING} strokeWidth={2} />
            )}
            <text x={cx} y={cy + 4} textAnchor="middle" className={`note-label${isRoot ? " root" : ""}`}>
              {label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/** Spelled name of a pitch class within the given scale. */
function noteNameAt(scale: Scale, pc: number): string {
  const note = scale.notes().find((n) => n.pitchClass === pc);
  return note ? note.name : String(pc);
}
