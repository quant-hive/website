import { useLayoutEffect, type RefObject } from "react";

/** Keeps two notes side by side (two <p>s in a three-column grid, a hairline
 *  between them) to the same number of lines: whichever runs to fewer is
 *  narrowed — as little as it takes — until it wraps to as many as the other.
 *  Then, with `inkCentred`, sets the hairline halfway between where the first
 *  note's text actually ends and the second's begins (a ragged edge leaves its
 *  box short); without it the hairline stays centred in its column.
 *  Rechecked whenever the notes change size (the window, the fonts loading).
 *  Used by the Careers and News pages. */
export function useEvenLines(ref: RefObject<HTMLDivElement | null>, { inkCentred = true } = {}) {
  useLayoutEffect(() => {
    const box = ref.current;
    if (!box) return;
    const [first, second] = box.querySelectorAll("p");
    if (!first || !second) return;
    const notes = [first, second];
    const between = first.nextElementSibling;
    const divider = between instanceof HTMLElement && between !== second ? between : null;
    // The text's own lines, not the box's height: a grid stretches the shorter
    // note's box to the taller one's.
    const lines = (p: HTMLElement) => {
      const range = document.createRange();
      range.selectNodeContents(p);
      return new Set([...range.getClientRects()].map((r) => Math.round(r.bottom))).size;
    };
    let width = 0;
    // The hairline, centred in the gap the text leaves.
    const centre = () => {
      if (!divider || !inkCentred) return;
      divider.style.translate = "";
      const range = document.createRange();
      range.selectNodeContents(first);
      const inkEnd = Math.max(...[...range.getClientRects()].map((r) => r.right));
      range.selectNodeContents(second);
      const inkStart = Math.min(...[...range.getClientRects()].map((r) => r.left));
      const line = divider.getBoundingClientRect();
      const shift = (inkEnd + inkStart) / 2 - (line.left + line.width / 2);
      if (Number.isFinite(shift)) divider.style.translate = `${Math.round(shift * 2) / 2}px 0`;
    };
    const even = () => {
      // Side by side only; stacked on a phone, each keeps its own lines.
      if (getComputedStyle(box).gridTemplateColumns.split(" ").length < 3) {
        notes.forEach((p) => (p.style.maxWidth = ""));
        if (divider) divider.style.translate = "";
        return;
      }
      notes.forEach((p) => (p.style.maxWidth = ""));
      const a = lines(first);
      const b = lines(second);
      if (a === b) return centre();
      const short = a < b ? first : second;
      const target = Math.max(a, b);
      // The widest width at which the shorter note wraps to the other's lines.
      let hi = short.getBoundingClientRect().width;
      let lo = hi * 0.4;
      for (let i = 0; i < 12; i++) {
        const mid = (lo + hi) / 2;
        short.style.maxWidth = `${mid}px`;
        if (lines(short) >= target) lo = mid;
        else hi = mid;
      }
      short.style.maxWidth = `${Math.floor(lo)}px`;
      centre();
    };
    even();
    const observer = new ResizeObserver(() => {
      const w = box.getBoundingClientRect().width;
      if (w !== width) {
        width = w;
        even();
      }
    });
    observer.observe(box);
    document.fonts?.ready.then(even);
    return () => observer.disconnect();
  }, [ref, inkCentred]);
}
