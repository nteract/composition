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
      lineWrapping,
      tip: true,
      completion: true
    };
  };
  return mapStateToProps;
};

export default connect(makeMapStateToProps)(CodeMirrorEditor);
