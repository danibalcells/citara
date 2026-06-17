import { useMemo, useState } from "react";
import { Note } from "./theory/note";
import { Mode } from "./theory/mode";
import { Scale } from "./theory/scale";
import { Fretboard as FretboardModel } from "./fret/fretboard";
import { Tuning } from "./fret/tuning";
import { shapes as buildShapes } from "./fret/shapes";
import { Fretboard, type ColorMode, type LabelMode } from "./ui/Fretboard";
import { Controls } from "./ui/Controls";

const DISPLAY_FRETS = 17;
const fretboard = new FretboardModel(Tuning.STANDARD, 22);

export default function App() {
  const [tonicName, setTonicName] = useState("A");
  const [mode, setMode] = useState<Mode>(Mode.Aeolian);
  const [colorMode, setColorMode] = useState<ColorMode>("all");
  const [labelMode, setLabelMode] = useState<LabelMode>("note");
  const [enabledShapes, setEnabledShapes] = useState<Set<number>>(
    () => new Set([0, 1, 2, 3, 4, 5, 6]),
  );

  const scale = useMemo(() => new Scale(Note.fromName(tonicName), mode), [tonicName, mode]);
  const shapeList = useMemo(() => buildShapes(scale, fretboard), [scale]);
  const homeShape = useMemo(
    () => shapeList.find((s) => s.isHome)?.index ?? 0,
    [shapeList],
  );

  const toggleShape = (i: number) =>
    setEnabledShapes((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });

  const allShapes = (on: boolean) =>
    setEnabledShapes(on ? new Set([0, 1, 2, 3, 4, 5, 6]) : new Set());

  return (
    <div className="app">
      <header>
        <h1>Cítara</h1>
        <p className="tagline">Scales and modes across the whole fretboard.</p>
      </header>

      <Controls
        tonicName={tonicName}
        onTonic={setTonicName}
        mode={mode}
        onMode={setMode}
        colorMode={colorMode}
        onColorMode={setColorMode}
        shapes={shapeList}
        enabledShapes={enabledShapes}
        onToggleShape={toggleShape}
        onAllShapes={allShapes}
        labelMode={labelMode}
        onLabelMode={setLabelMode}
      />

      <div className="board-scroll">
        <Fretboard
          scale={scale}
          fretboard={fretboard}
          displayFrets={DISPLAY_FRETS}
          colorMode={colorMode}
          shapes={shapeList}
          enabledShapes={enabledShapes}
          labelMode={labelMode}
          homeShape={homeShape}
        />
      </div>
    </div>
  );
}
