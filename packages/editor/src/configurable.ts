import { EditorConfiguration } from "codemirror";

// For some reason the addon typings don't export options we need for
// recomposition. Instead they add on to the EditorConfiguration interface.
// As a result we have to import bare modules to get the additional properties
// we want on the EditorConfiguration interface.
// import "codemirror/addon/edit/codemirror-matchbrackets";
// import "codemirror/add/hint/codemirror-showhint";
// import "codemirror/addon/edit/closebrackets"
// However, if we import these they're on the wrong path for actual import and
// webpack fails. Instead we'll encode our typings here...

type FullEditorConfiguration = EditorConfiguration & {
  showHint?: boolean;
  hintOptions?: any;
  matchBrackets?: boolean;
  autoCloseBrackets?: boolean;
};

export { FullEditorConfiguration };

// Declare which options we allow being configured
export const configurableCodeMirrorOptions: {
  // Ensure we capture each of the editor configuration options
  [k in keyof FullEditorConfiguration]: boolean;
} = {
  // Do nothing with value, we handle it in a separately managed way
  value: false,
  mode: true,
  autoCloseBrackets: true,
  matchBrackets: true,
  // We don't allow overriding the theme as we use this to help theme codemirror
  theme: false,
  indentUnit: true,
  smartIndent: true,
  tabSize: true,
  indentWithTabs: true,
  electricChars: true,
  rtlMoveVisually: true,
  keyMap: true,
  // We're in control of `extraKeys` since we need to bind them to our events
  extraKeys: false,
  lineWrapping: true,
  lineNumbers: true,
  firstLineNumber: true,
  lineNumberFormatter: true,
  gutters: true,
  fixedGutter: true,
  readOnly: true,
  showCursorWhenSelecting: true,
  undoDepth: true,
  historyEventDelay: true,
  tabindex: true,
  autofocus: true,
  dragDrop: true,
  onDragEvent: true,
  onKeyEvent: true,
  cursorBlinkRate: true,
  cursorHeight: true,
  workTime: true,
  workDelay: true,
  pollInterval: true,
  flattenSpans: true,
  maxHighlightLength: true,
  viewportMargin: true,
  lint: true,
  placeholder: true,

  // CodeMirror addon configurations
  showHint: true,
  // We don't want overriding of the hint behavior
  hintOptions: false
};

export function isConfigurable(
  option: any
): option is keyof EditorConfiguration {
  return !!(configurableCodeMirrorOptions as { [s: string]: boolean })[option];
}
