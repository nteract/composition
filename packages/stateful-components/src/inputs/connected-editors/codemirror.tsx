import { AppState, ContentRef, selectors } from "@nteract/core";
import CodeMirrorEditor from "@nteract/editor";
import { createConfigOption } from "@nteract/mythic-configuration";
import { connect } from "react-redux";

const {
  selector: cursorBlinkRate,
} = createConfigOption({
  key: "cursorBlinkRate",
  label: "Cursor blinking",
  values: [
    { value: 530, label: "On" },
    { value: 0, label: "Off" },
  ]
}, 530);

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
      cursorBlinkRate: cursorBlinkRate(state),
      lineWrapping,
      tip: true,
      completion: true
    };
  };
  return mapStateToProps;
};

export default connect(makeMapStateToProps)(CodeMirrorEditor);
