import React from "react";

import {
  Outputs,
  PromptBuffer,
  Input
} from "@nteract/presentational-components";

import {
  TrashOcticon,
  TriangleRightOcticon
} from "@nteract/octicons";

import { Editor, EditorState, RichUtils, getDefaultKeyBinding,
         convertFromRaw } from "draft-js";

import { markdownToDraft } from "markdown-draft-js";

class StyleButton extends React.Component {
  constructor() {
    super();
    this.onToggle = e => {
      e.preventDefault();
      this.props.onToggle(this.props.style);
    };
  }
  render() {
    if (this.props.active) {
      //className += " RichEditor-activeButton";
    }
    return (
        <span className="octicon" onMouseDown={this.onToggle}>
          <TrashOcticon />
        </span>
    );
  }
}

const BLOCK_TYPES = [
  { label: "H1", style: "header-one" },
  { label: "H2", style: "header-two" },
  { label: "H3", style: "header-three" },
  { label: "H4", style: "header-four" },
  { label: "H5", style: "header-five" },
  { label: "H6", style: "header-six" },
  { label: "Blockquote", style: "blockquote" },
  { label: "UL", style: "unordered-list-item" },
  { label: "OL", style: "ordered-list-item" },
  { label: "Code Block", style: "code-block" }
];
const BlockStyleControls = props => {
  const { editorState } = props;
  const selection = editorState.getSelection();
  const blockType = editorState
    .getCurrentContent()
    .getBlockForKey(selection.getStartKey())
    .getType();
  return (
    <React.Fragment>
      <div className="RichEditor-controls">
        {BLOCK_TYPES.map(type => (
          <StyleButton
            key={type.label}
            active={type.style === blockType}
            label={type.label}
            onToggle={props.onToggle}
            style={type.style}
          />
        ))}
      </div>
      <style jsx>{`
        .RichEditor-controls {
          font-family: "Helvetica", sans-serif;
          font-size: 14px;
          margin-bottom: 5px;
          user-select: none;
        }
      `}</style>
    </React.Fragment>
  );
};

var INLINE_STYLES = [
  { label: "Bold", style: "BOLD" },
  { label: "Italic", style: "ITALIC" },
  { label: "Underline", style: "UNDERLINE" },
  { label: "Monospace", style: "CODE" }
];
const InlineStyleControls = props => {
  const currentStyle = props.editorState.getCurrentInlineStyle();

  return (
    <React.Fragment>
      <div className="RichEditor-controls">
        {INLINE_STYLES.map(type => (
          <StyleButton
            key={type.label}
            active={currentStyle.has(type.style)}
            label={type.label}
            onToggle={props.onToggle}
            style={type.style}
          />
        ))}
      </div>
      <style jsx>{`
        .RichEditor-controls {
          font-family: "Helvetica", sans-serif;
          font-size: 14px;
          margin-bottom: 5px;
          user-select: none;
        }
      `}</style>
    </React.Fragment>
  );
};

const noop = function() {};

export default class MyMarkdown extends React.Component {
  static defaultProps = {
    cellFocused: false,
    editorFocused: false,
    focusAbove: noop,
    focusBelow: noop,
    focusEditor: noop,
    unfocusEditor: noop,
    source: ""
  };

  constructor(props) {
    super(props);
    const raw = markdownToDraft(
      this.props.source
    );
    this.state = {
      editorState: EditorState.createWithContent(convertFromRaw(raw)),
    };
    this.onChange = editorState => {
      this.setState({ editorState });
    };
    this.handleKeyCommand = this.handleKeyCommand.bind(this);
    this.toggleBlockType = this._toggleBlockType.bind(this);
    this.toggleInlineStyle = this._toggleInlineStyle.bind(this);
    (this: any).openEditor = this.openEditor.bind(this);
    (this: any).closeEditor = this.closeEditor.bind(this);
    (this: any).editingKeyDown = this.editingKeyDown.bind(this);
    this.editor = React.createRef();
  }
  _toggleBlockType(blockType) {
    this.onChange(RichUtils.toggleBlockType(this.state.editorState, blockType));
  }
  _toggleInlineStyle(inlineStyle) {
    this.onChange(
      RichUtils.toggleInlineStyle(this.state.editorState, inlineStyle)
    );
  }
  editingKeyDown(e: SyntheticKeyboardEvent<*>) {
    console.log('edit keyed!', e.key)
    const shift = e.shiftKey;
    const ctrl = e.ctrlKey;
    if ((shift || ctrl) && e.key === "Enter") {
      this.closeEditor();
      e.preventDefault();
      return;
    }

    switch (e.key) {
      case "ArrowUp":
        this.props.focusAbove();
        e.preventDefault();
        return;
      case "ArrowDown":
        this.props.focusBelow();
        e.preventDefault();
        return;
      default:
    }
    return getDefaultKeyBinding(e);
  }
  handleKeyCommand(command, editorState) {
    console.log('key command', command)
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      this.onChange(newState);
      return "handled";
    }
    return "not-handled";
  }
  openEditor(): void {
    this.refs.editor.focus()
    this.props.focusEditor();
  }
  closeEditor(): void {
    this.props.unfocusEditor();
  }
  componentDidUpdate(prevProps, prevState) {
    if (this.props.editorFocused) {
      this.openEditor();
      console.log('editor got focus, opened edit')
    }
    else {
      this.closeEditor();
      console.log('edit lost focus, closed edit')
    }
  }
  render() {
    return (
      <React.Fragment>
        <Outputs>
          <div
            className="RichEditor-root"
            onDoubleClick={this.openEditor}
          >
            { this.props.editorFocused ?
              (
                <React.Fragment>
                  <BlockStyleControls
                    editorState={this.state.editorState}
                    onToggle={this.toggleBlockType}
                  />
                  <InlineStyleControls
                    editorState={this.state.editorState}
                    onToggle={this.toggleInlineStyle}
                  />
                </React.Fragment>
              )
              :
              ""
            }
            <Editor
              readOnly={!this.props.editorFocused}
              editorState={this.state.editorState}
              onChange={this.onChange}
              keyBindingFn={this.editingKeyDown}
              onUpArrow={this.editingKeyDown}
              onDownArrow={this.editingKeyDown}
              handleKeyCommand={this.handleKeyCommand}
              ref="editor"
              placeholder={"Empty markdown cell, click me to add content."}
            />
          </div>
        </Outputs>
        <style jsx>
          {`
            .RichEditor-root {
              background: var(--theme-app-bg);
            }

            .RichEditor-editor {
              border-top: 1px solid #ddd;
              cursor: text;
              font-size: 16px;
              margin-top: 10px;
            }

            .RichEditor-editor .public-DraftEditorPlaceholder-root,
            .RichEditor-editor .public-DraftEditor-content {
              margin: 0 -15px -15px;
              padding: 15px;
            }

            .RichEditor-editor .public-DraftEditor-content {
              min-height: 100px;
            }

            .RichEditor-hidePlaceholder .public-DraftEditorPlaceholder-root {
              display: none;
            }

            .RichEditor-editor .RichEditor-blockquote {
              border-left: 5px solid #eee;
              color: #666;
              font-family: "Hoefler Text", "Georgia", serif;
              font-style: italic;
              margin: 16px 0;
              padding: 10px 20px;
            }

            .RichEditor-editor .public-DraftStyleDefault-pre {
              background-color: rgba(0, 0, 0, 0.05);
              font-family: "Inconsolata", "Menlo", "Consolas", monospace;
              font-size: 16px;
              padding: 20px;
            }

            .RichEditor-controls {
              font-family: "Helvetica", sans-serif;
              font-size: 14px;
              margin-bottom: 5px;
              user-select: none;
            }

            .RichEditor-styleButton {
              color: #999;
              cursor: pointer;
              margin-right: 16px;
              padding: 2px 0;
              display: inline-block;
            }

            .RichEditor-activeButton {
              color: #5890ff;
            }
          `}
        </style>
      </React.Fragment>
    );
  }
}
