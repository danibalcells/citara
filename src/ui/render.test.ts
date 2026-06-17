import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import { createElement } from "react";
import App from "../App";

describe("app renders", () => {
  it("mounts without throwing and draws the fretboard", () => {
    const html = renderToString(createElement(App));
    expect(html).toContain("Cítara");
    expect(html).toContain("<svg");
    // A minor: open A string (string 1, fret 0) root should be labelled.
    expect(html).toContain("note-label");
  });
});
