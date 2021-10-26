import { AppState, actions } from "@nteract/core";
import CodeMirrorEditor from "@nteract/editor";
import { createConfigCollection, createDeprecatedConfigOption, defineConfigOption, HasPrivateConfigurationState } from "@nteract/mythic-configuration";
import { CellAddress, HasPrivateLanguageInfoState, lineWrappingOfCell, modeOfCell } from "@nteract/mythic-notebook";
import { connect } from "react-redux";
import { Dispatch } from "redux";

const codeMirrorConfig = createConfigCollection({
  key: "codeMirror",
});

createDeprecatedConfigOption({
  key: "cursorBlinkRate",
  changeTo: (value: number) => ({
    "codeMirror.cursorBlinkRate": value,
  }),
});

const BOOLEAN = [
  { label: "Yes", value: true },
  { label: "No", value: false },
];

defineConfigOption({
  label: "Blink Editor Cursor",
  key: "codeMirror.cursorBlinkRate",
  values: [
    { label: "Yes", value: 530 },
    { label: "No", value: 0 },
  ],
  defaultValue: 0,
});

defineConfigOption({
  label: "Show Cursor When Selecting",
  key: "codeMirror.showCursorWhenSelecting",
  values: BOOLEAN,
  defaultValue: false,
});

defineConfigOption({
  label: "Close Brackets Automatically",
  key: "codeMirror.autoCloseBrackets",
  values: BOOLEAN,
  defaultValue: false,
});

defineConfigOption({
  label: "Show Matching Brackets",
  key: "codeMirror.matchBrackets",
  values: BOOLEAN,
  defaultValue: true,
});

defineConfigOption({
  label: "Use Smart Indent",
  key: "codeMirror.smartIndent",
  values: BOOLEAN,
  defaultValue: true,
});

defineConfigOption({
  label: "Tab Size",
  key: "codeMirror.tabSize",
  values: [
    { label: "2 Spaces", value: 2 },
    { label: "3 Spaces", value: 3 },
    { label: "4 Spaces", value: 4 },
  ],
  defaultValue: 4,
});

defineConfigOption({
  label: "Show Line Numbers",
  key: "codeMirror.lineNumbers",
  values: BOOLEAN,
  defaultValue: false,
});

const makeMapStateToProps = (state: AppState & HasPrivateConfigurationState & HasPrivateLanguageInfoState, cell: CellAddress) =>
  (state: AppState & HasPrivateConfigurationState & HasPrivateLanguageInfoState) => ({
    codeMirror: {
      mode: {
        name: modeOfCell(state, cell, "codemirror") ?? "null",
        tokenTypeOverrides: {
          emoji: "emoji",
        },
      },
      ...codeMirrorConfig(state),
    },
    lineWrapping: lineWrappingOfCell(state, cell) ?? true,
    tip: true,
    completion: true,
  });

const makeMapDispatchToProps = (initialDispatch: Dispatch, cell: CellAddress) =>
  (dispatch: Dispatch) => ({
    focusBelow: () => {
      dispatch(actions.focusNextCell({ ...cell, createCellIfUndefined: true }));
      dispatch(actions.focusNextCellEditor(cell));
    },
    focusAbove: () => {
      dispatch(actions.focusPreviousCell(cell));
      dispatch(actions.focusPreviousCellEditor(cell));
    }
  });

export default connect(makeMapStateToProps, makeMapDispatchToProps)(CodeMirrorEditor);
