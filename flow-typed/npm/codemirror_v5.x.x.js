declare module "codemirror" {
  declare export default typeof CodeMirror

  declare type Position = { line: number, ch: number };

  declare class TextMarker {
    changed(): void,
    clear(): void,
    find(): { from: Position, to: Position }
  }

  declare type TextMarkerOptions = {
    atomic?: boolean,
    className?: string,
    css?: string,
    readOnly?: boolean
  };

  declare class Doc {
    size: number, // undocumented (number of lines)
    clearHistory(): void,
    eachLine(f: (l: LineHandle) => void): void,
    getCursor(start?: "anchor" | "from" | "to" | "head"): Position,
    markClean(): void,
    isClean(generation?: number): boolean,
    setValue(string): void,
    markText(
      from: Position,
      to: Position,
      options?: TextMarkerOptions
    ): TextMarker
  }

  declare export type CodeMirrorOptions = {
    cursorBlinkRate?: number,
    disableScrollWheel?: boolean,
    firstLineNumber?: number,
    gutters?: Array<string>,
    lineWrapping?: boolean,
    lineNumbers?: boolean,
    lineNumberFormatter?: (line: number) => string,
    mode?: ?string,
    readOnly?: boolean,
    scrollbarStyle?: "native" | null,
    theme?: string,
    undoDepth?: number,
    extraKeys?: { [key: string]: (cm: CodeMirror) => void }
  };

  declare class Cursor {
    pos: { from: Position, to: Position }, // undocumented
    find(): { from: Position, to: Position } | false, // undocumented
    findNext(): boolean,
    findPrevious(): boolean,
    from(): Position,
    to(): Position,
    replace(text: string, origin?: string): void
  }

  declare class LineHandle {
    gutterMarkers: { [gutterId: string]: string },
    height: number,
    text: string,
    widgets: Array<Widget>
    // other obviously private properties
  }

  declare class Widget {
    line: LineHandle,
    changed(): void,
    clear(): void
  }

  declare type Events = {
    change: (
      cm: CodeMirror,
      changeObj: {
        from: Position,
        to: Position,
        text: string,
        removed: string,
        origin: string
      }
    ) => void,
    cursorActivity: (cm: CodeMirror) => void,
    focus: (cm: CodeMirror, event: SyntheticEvent) => void,
    gutterClick: (
      cm: CodeMirror,
      line: number,
      gutter: string,
      clickEvent: SyntheticMouseEvent
    ) => void
  };

  declare class CodeMirror {
    static fromTextArea(
      textArea: HTMLElement,
      config?: CodeMirrorOptions
    ): CodeMirror,

    static defineMode(mimetype: string, modefactory: any): void,
    static getMode(config: any, mode: any): any, // not typed well

    // Not sure if this is real, wasn't in the typescript defs
    static defineMIME(mimetype: string, mode: string): void,

    static signal(target: any, name: string): void,
    static signal(target: any, name: string, ...args: any[]): void,
    signal(target: any, name: string): void,
    signal(target: any, name: string, ...args: any[]): void,

    addLineClass(
      line: number | LineHandle,
      where: string,
      className: string
    ): LineHandle,
    removeLineClass(
      line: number | LineHandle,
      where: string,
      className?: string
    ): LineHandle,
    addLineWidget(
      line: number | LineHandle,
      node: HTMLElement,
      options?: {
        coverGutter?: boolean,
        noHScroll?: boolean,
        above?: boolean,
        handleMouseEvents?: boolean,
        insertAt?: boolean
      }
    ): Widget,
    charCoords(
      pos: Position,
      mode?: string
    ): { left: number, right: number, top: number, bottom: number },
    clearGutter(gutterId: string): void,
    defaultTextHeight(): number,
    findMarks(from: Position, to: Position): Array<TextMarker>,
    focus(): void,
    getDoc(): Doc,
    getSearchCursor(
      query: string,
      start: ?Position,
      options: ?{ caseFold?: boolean, multiline?: boolean }
    ): Cursor,
    getScrollerElement(): HTMLElement,
    getScrollInfo(): {
      top: number,
      left: number,
      width: number,
      height: number,
      clientWidth: number,
      clientHeight: number
    },
    getValue(separator?: string): string,
    setValue(string): void,
    getWrapperElement(): HTMLElement,
    lastLine(): number,
    lineAtHeight(height: number, mode?: "window" | "page" | "local"): number,
    lineInfo(
      n: number
    ): {
      textClass: string
    },

    on<K: $Keys<Events>>(type: K, value: any): void,
    off<K: $Keys<Events>>(type: K, value: any): void,

    // For a future flow version
    // on<K: $Keys<Events>>(type: K, value: $ElementType<Events, K>): void;
    // off<K: $Keys<Events>>(type: K, value: $ElementType<Events, K>): void;
    refresh(): void,
    scrollTo(left: ?number, top: ?number): void,
    setGutterMarker(
      line: number | LineHandle,
      gutterId: string,
      value: HTMLElement
    ): LineHandle,
    setOption<K: $Keys<CodeMirrorOptions>>(option: K, value: any): void,
    // Future flow
    // setOption<K: $Keys<CodeMirrorOptions>>(option: K, value: $ElementType<CodeMirrorOptions, K>): void;
    // https://codemirror.net/doc/manual.html#setSelection
    setSelection(
      anchor: Position,
      head?: Position,
      options?: {
        scroll?: boolean,
        origin?: string,
        bias?: -1 | 1
      }
    ): void,
    setSize(width: number | string | null, height: number | string | null): void
  }

  declare var exports: CodeMirror;
}
