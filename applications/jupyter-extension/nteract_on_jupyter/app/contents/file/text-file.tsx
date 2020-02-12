import { actions, AppState, ContentRef, selectors } from "@nteract/core";
import { MonacoEditorProps } from "@nteract/monaco-editor";
import { theme } from "@nteract/mythic-configuration";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import styled from "styled-components";

const EditorContainer = styled.div`
  position: absolute;
  left: 0;
  height: 100%;
  width: 100%;

  .monaco {
    height: 100%;
  }
`;

interface MappedStateProps {
  mimetype: string;
  text: string;
  contentRef: ContentRef;
  theme: "light" | "dark";
}

interface MappedDispatchProps {
  handleChange: (value: string) => void;
}

type TextFileProps = MappedStateProps & MappedDispatchProps;

interface TextFileState {
  Editor: React.ComponentType<MonacoEditorProps>;
}

class EditorPlaceholder extends React.PureComponent<MonacoEditorProps> {
  render(): JSX.Element {
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

  handleChange = (source: string) => {
    this.props.handleChange(source);
  };

  componentDidMount(): void {
    import(/* webpackChunkName: "monaco-editor" */ "@nteract/monaco-editor").then(
      module => {
        this.setState({ Editor: module.default });
      }
    );
  }

  render(): JSX.Element {
    const Editor = this.state.Editor;

    return (
      <EditorContainer className="nteract-editor">
        <Editor
          theme={this.props.theme === "dark" ? "vs-dark" : "vs"}
          mode={this.props.mimetype}
          editorFocused
          value={this.props.text}
          onChange={this.handleChange.bind(this)}
        />
      </EditorContainer>
    );
  }
}

interface InitialProps {
  contentRef: ContentRef;
}

function makeMapStateToTextFileProps(
  initialState: AppState,
  initialProps: InitialProps
): (state: AppState) => MappedStateProps {
  const { contentRef } = initialProps;

  const mapStateToTextFileProps = (state: AppState) => {
    const content = selectors.content(state, { contentRef });
    if (!content || content.type !== "file") {
      throw new Error("The text file component must have content");
    }

    const text = content.model ? content.model.text : "";

    return {
      contentRef,
      mimetype: content.mimetype != null ? content.mimetype : "text/plain",
      text,
      theme: theme(state)
    };
  };
  return mapStateToTextFileProps;
}

const makeMapDispatchToTextFileProps = (
  initialDispatch: Dispatch,
  initialProps: InitialProps
): ((dispatch: Dispatch) => MappedDispatchProps) => {
  const { contentRef } = initialProps;

  const mapDispatchToTextFileProps = (dispatch: Dispatch) => {
    return {
      handleChange: (source: string) => {
        dispatch(
          actions.updateFileText({
            contentRef,
            text: source
          })
        );
      }
    };
  };
  return mapDispatchToTextFileProps;
};

const ConnectedTextFile = connect<
  MappedStateProps,
  MappedDispatchProps,
  InitialProps,
  AppState
>(
  makeMapStateToTextFileProps,
  makeMapDispatchToTextFileProps
)(TextFile);

export function handles(mimetype: string) {
  return (
    mimetype.startsWith("text/") ||
    mimetype.startsWith("application/javascript") ||
    mimetype.startsWith("application/json")
  );
}

export default ConnectedTextFile;
