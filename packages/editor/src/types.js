// Declare CMI as the CodeMirror instance, even if we don't have it fully typed yet
export type CMI = any;

import type { Subject } from "rxjs";

declare class TextMarker {
  changed(): void;
  clear(): void;
  find(): { from: Position, to: Position };
}

export type TextMarkerOptions = {
  atomic?: boolean,
  className?: string,
  css?: string,
  readOnly?: boolean
};

export type LineHandle = any;

declare class CMDoc {
  size: number; // undocumented (number of lines)
  clearHistory(): void;
  eachLine(f: (l: LineHandle) => void): void;
  getCursor(start?: "anchor" | "from" | "to" | "head"): Position;
  markClean(): void;
  isClean(generation?: number): boolean;
  setValue(string): void;
  getValue(separator?: string): string;
  markText(
    from: Position,
    to: Position,
    options?: TextMarkerOptions
  ): TextMarker;
}

export type EditorChange = {
  /** Position (in the pre-change coordinate system) where the change started. */
  from: Position,
  /** Position (in the pre-change coordinate system) where the change ended. */
  to: Position,
  /** Array of strings representing the text that replaced the changed range (split by line). */
  text: Array<string>,
  /**  Text that used to be between from and to, which is overwritten by this change. */
  removed: Array<string>,
  /**  String representing the origin of the change event and wether it can be merged with history */
  origin: string
};

export type ScrollInfo = {
  top: number,
  left: number,
  width: number,
  height: number,
  clientWidth: number,
  clientHeight: number
};

export type Position = {
  ch: number,
  line: number
};

export type Options = {
  cursorBlinkRate?: number,
  mode?: string,
  preserveScrollPosition?: boolean
};
