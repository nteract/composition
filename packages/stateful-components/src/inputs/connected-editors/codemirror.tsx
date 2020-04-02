import { connect } from "react-redux";

import { selectors, AppState, ContentRef } from "@nteract/core";
import CodeMirrorEditor from "@nteract/editor";

const markdownMode = {
  name: "gfm",
  tokenTypeOverrides: {
    emoji: "emoji"
  }
};

const rawMode = {
  name: "text/plain",
  tokenTypeOverrides: {
    emoji: "emoji"
  }
};

interface ComponentProps {
  id: string;
  contentRef: ContentRef;
  editorType: string;
}

const makeMapStateToProps = (state: AppState, ownProps: ComponentProps) => {
  const { id, contentRef } = ownProps;
  const mapStateToProps = (state: AppState) => {
    let mode = rawMode;
    let cursorBlinkRate = state.config.get("codeMirror.cursorBlinkRate", 530);
    let showCursorWhenSelecting = state.config.get(
      "codeMirror.showCursorWhenSelecting",
      false
    );
    let autoCloseBrackets = state.config.get(
      "codeMirror.autoCloseBrackets",
      false
    );
    let matchBrackets = state.config.get("codeMirror.matchBrackets", true);
    let smartIndent = state.config.get("codeMirror.smartIndent", true);
    let tabSize = state.config.get("codeMirror.tabSize", 4);
    let lineNumbers = state.config.get("codeMirror.lineNumbers", false);
    let lineWrapping = true;
    const model = selectors.model(state, { contentRef });
    const kernel = selectors.kernelByContentRef(state, { contentRef });

    if (model && model.type === "notebook") {
      const cell = selectors.notebook.cellById(model, { id });
      if (cell) {
        switch (cell.cell_type) {
          case "markdown":
            mode = markdownMode;
            break;
          case "code":
            lineWrapping = false;
            mode =
              kernel?.info?.codemirrorMode ||
              selectors.notebook.codeMirrorMode(model);
            break;
          default:
            mode = rawMode;
            break;
        }
      }
    }
    return {
      mode,
      cursorBlinkRate,
      showCursorWhenSelecting,
      autoCloseBrackets,
      matchBrackets,
      smartIndent,
      tabSize,
      lineNumbers,
      lineWrapping,
      tip: true,
      completion: true
    };
  };
  return mapStateToProps;
};

export default connect(makeMapStateToProps)(CodeMirrorEditor);
