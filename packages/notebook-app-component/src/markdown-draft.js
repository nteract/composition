import React from "react";
import {Editor, EditorState, RichUtils, convertFromRaw} from 'draft-js';

import { markdownToDraft } from 'markdown-draft-js';


class StyleButton extends React.Component {
  constructor() {
    super();
    this.onToggle = (e) => {
      e.preventDefault();
      this.props.onToggle(this.props.style);
    };
  }
  render() {
    let className = 'RichEditor-styleButton';
    if (this.props.active) {
      className += ' RichEditor-activeButton';
    }
    return (
      <React.Fragment>
        <span className={className} onMouseDown={this.onToggle}>
          {this.props.label}
        </span>
        <style jsx>{`
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

const BLOCK_TYPES = [
  {label: 'H1', style: 'header-one'},
  {label: 'H2', style: 'header-two'},
  {label: 'H3', style: 'header-three'},
  {label: 'H4', style: 'header-four'},
  {label: 'H5', style: 'header-five'},
  {label: 'H6', style: 'header-six'},
  {label: 'Blockquote', style: 'blockquote'},
  {label: 'UL', style: 'unordered-list-item'},
  {label: 'OL', style: 'ordered-list-item'},
  {label: 'Code Block', style: 'code-block'},
];
const BlockStyleControls = (props) => {
  const {editorState} = props;
  const selection = editorState.getSelection();
  const blockType = editorState
    .getCurrentContent()
    .getBlockForKey(selection.getStartKey())
    .getType();
  return (
    <React.Fragment>
      <div className="RichEditor-controls">
        {BLOCK_TYPES.map((type) =>
          <StyleButton
            key={type.label}
            active={type.style === blockType}
            label={type.label}
            onToggle={props.onToggle}
            style={type.style}
          />
        )}
      </div>
      <style jsx>{`
        .RichEditor-controls {
          font-family: 'Helvetica', sans-serif;
          font-size: 14px;
          margin-bottom: 5px;
          user-select: none;
        }
      `}</style>
    </React.Fragment>
  );
};

var INLINE_STYLES = [
  {label: 'Bold', style: 'BOLD'},
  {label: 'Italic', style: 'ITALIC'},
  {label: 'Underline', style: 'UNDERLINE'},
  {label: 'Monospace', style: 'CODE'},
];
const InlineStyleControls = (props) => {
  const currentStyle = props.editorState.getCurrentInlineStyle();

  return (
    <React.Fragment>
      <div className="RichEditor-controls">
        {INLINE_STYLES.map((type) =>
          <StyleButton
            key={type.label}
            active={currentStyle.has(type.style)}
            label={type.label}
            onToggle={props.onToggle}
            style={type.style}
          />
        )}
      </div>
      <style jsx>{`
        .RichEditor-controls {
          font-family: 'Helvetica', sans-serif;
          font-size: 14px;
          margin-bottom: 5px;
          user-select: none;
        }
      `}</style>
    </React.Fragment>
  );
};


export default class MyMarkdown extends React.Component {
  constructor(props) {
    super(props);
    const raw = markdownToDraft(this.props.source);
    this.state = {editorState: EditorState.createWithContent(convertFromRaw(raw))};
    this.onChange = (editorState) => this.setState({editorState});
    this.handleKeyCommand = this.handleKeyCommand.bind(this);
    this.toggleBlockType = this._toggleBlockType.bind(this);
    this.toggleInlineStyle = this._toggleInlineStyle.bind(this);
  }
  _toggleBlockType(blockType) {
    this.onChange(
      RichUtils.toggleBlockType(
        this.state.editorState,
        blockType
      )
    );
  }
  _toggleInlineStyle(inlineStyle) {
    this.onChange(
      RichUtils.toggleInlineStyle(
        this.state.editorState,
        inlineStyle
      )
    );
  }
  handleKeyCommand(command, editorState) {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      this.onChange(newState);
      return 'handled';
    }
    return 'not-handled';
  }
  render() {
    return (
      <React.Fragment>
        <div className="RichEditor-root">
          <BlockStyleControls
            editorState={this.state.editorState}
            onToggle={this.toggleBlockType}
          />
          <InlineStyleControls
            editorState={this.state.editorState}
            onToggle={this.toggleInlineStyle}
          />
          <Editor
            editorState={this.state.editorState}
            onChange={this.onChange}
            handleKeyCommand={this.handleKeyCommand}
          />
        </div>
        <style jsx>{`
          .RichEditor-root {
            background: #fff;
            border: 1px solid #ddd;
            font-family: 'Georgia', serif;
            font-size: 14px;
            padding: 15px;
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
            font-family: 'Hoefler Text', 'Georgia', serif;
            font-style: italic;
            margin: 16px 0;
            padding: 10px 20px;
          }

          .RichEditor-editor .public-DraftStyleDefault-pre {
            background-color: rgba(0, 0, 0, 0.05);
            font-family: 'Inconsolata', 'Menlo', 'Consolas', monospace;
            font-size: 16px;
            padding: 20px;
          }

          .RichEditor-controls {
            font-family: 'Helvetica', sans-serif;
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
