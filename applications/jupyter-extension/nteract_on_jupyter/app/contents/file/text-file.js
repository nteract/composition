// @flow
import * as React from "react";

import type { AppState, ContentRef, FileContentRecord } from "@nteract/core";
import { selectors, actions } from "@nteract/core";

import { connect } from "react-redux";

type MappedStateProps = {
  mimetype: string,
  text: string,
  contentRef: ContentRef,
  theme: "light" | "dark"
};

type MappedDispatchProps = {
  handleChange: string => void
};

type TextFileProps = MappedStateProps & MappedDispatchProps;

type TextFileState = {
  Editor: React.ComponentType<any>
};

class EditorPlaceholder extends React.Component<any, null> {
  render() {
    // TODO: Show a little blocky placeholder
    return null;
  }
}

export class TextFile extends React.PureComponent<
  TextFileProps,
  TextFileState
> {
  constructor(props: TextFileProps) {
    super(props);
    this.state = {
      Editor: EditorPlaceholder
    };
  }

  handleChange(source: string) {
    this.props.handleChange(source);
  }
  componentDidMount() {
    import(/* webpackChunkName: "monaco-editor" */ "@nteract/monaco-editor").then(
      module => {
        this.setState({ Editor: module.default });
      }
    );
  }
  render() {
    const Editor = this.state.Editor;

    return (
      <div className="nteract-editor">
        <Editor
          theme={this.props.theme === "dark" ? "vs-dark" : "vs"}
          mode={this.props.mimetype}
          editorFocused={true}
          value={this.props.text}
          onChange={this.handleChange.bind(this)}
          contentRef={this.props.contentRef}
        />
        <style jsx>{`
          .nteract-editor {
            position: absolute;
            left: 0;
            height: 100%;
            width: 100%;
          }

          .nteract-editor :global(.monaco) {
            height: 100%;
          }
        `}</style>
      </div>
    );
  }
}

function mapStateToTextFileProps(
  state: AppState,
  ownProps: { contentRef: ContentRef }
): MappedStateProps {
  const content = selectors.content(state, ownProps);
  if (!content || content.type !== "file") {
    throw new Error("The text file component must have content");
  }

  const text = content.model ? content.model.text : "";

  return {
    theme: selectors.currentTheme(state),
    mimetype: content.mimetype || "text/plain",
    text: text,
    contentRef: ownProps.contentRef
  };
}

const mapDispatchToTextFileProps = (
  dispatch,
  ownProps
): MappedDispatchProps => ({
  handleChange: (source: string) => {
    dispatch(
      actions.updateFileText({
        text: source,
        contentRef: ownProps.contentRef
      })
    );
  }
});

const ConnectedTextFile = connect(
  mapStateToTextFileProps,
  mapDispatchToTextFileProps
)(TextFile);

export function handles(mimetype: string) {
  return (
    mimetype.startsWith("text/") ||
    mimetype.startsWith("application/javascript") ||
    mimetype.startsWith("application/json")
  );
}

export default ConnectedTextFile;
