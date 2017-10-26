// @flow

/* eslint jsx-a11y/no-static-element-interactions: 0 */

import React from "react";
import CommonMark from "commonmark";
import MarkdownRenderer from "commonmark-react-renderer";

import Editor from "../../providers/editor";
import LatexRenderer from "../latex";

// TODO: Remove after provider refactor finished
const PropTypes = require("prop-types");

type Props = {
  cell: any,
  id: string,
  theme: string,
  focusAbove: () => void,
  focusBelow: () => void,
  clickedOutputs: Function,
  addFocused: Function,
  focusEditor: Function,
  cellFocused: boolean,
  editorFocused: boolean
};

type State = {
  view: boolean,
  source: string
};

type MDRender = (input: string) => string;

const parser = new CommonMark.Parser();
const renderer = new MarkdownRenderer();

const mdRender: MDRender = input => renderer.render(parser.parse(input));

export default class MarkdownCell extends React.PureComponent<any, State> {
  openEditor: () => void;
  editorKeyDown: (e: SyntheticKeyboardEvent<*>) => void;
  renderedKeyDown: (e: SyntheticKeyboardEvent<*>) => boolean;
  rendered: ?HTMLElement;

  static contextTypes = {
    store: PropTypes.object
  };

  static defaultProps = {
    cellFocused: false
  };

  constructor(props: Props): void {
    super(props);
    this.state = {
      view: true,
      // HACK: We'll need to handle props and state change better here
      source: this.props.cell.get("source")
    };
    this.openEditor = this.openEditor.bind(this);
    this.editorKeyDown = this.editorKeyDown.bind(this);
    this.renderedKeyDown = this.renderedKeyDown.bind(this);
    this.addFocused = this.props.addFocused.bind(this);
  }

  componentDidMount(): void {
    this.updateFocus();
  }

  componentWillReceiveProps(nextProps: Props): void {
    this.setState({
      view: !nextProps.editorFocused,
      source: nextProps.cell.get("source")
    });
  }

  componentDidUpdate(): void {
    this.updateFocus();
  }

  updateFocus(): void {
    if (
      this.rendered &&
      this.state &&
      this.state.view &&
      this.props.cellFocused
    ) {
      this.rendered.focus();
      if (this.props.editorFocused) {
        this.openEditor();
      }
    }
  }

  /**
   * Handles when a keydown event occurs on the unrendered MD cell
   */
  editorKeyDown(e: SyntheticKeyboardEvent<*>): void {
    // TODO: ctrl-enter will set the state view mode, _however_
    //       the focus is still set from above the editor
    //       Suggestion: we need a `this.props.unfocusEditor`
    //       It's either that or we should be setting `view` from
    //       the outside
    const shift = e.shiftKey;
    const ctrl = e.ctrlKey;
    if ((shift || ctrl) && e.key === "Enter") {
      this.setState({ view: true });
    }
  }

  openEditor(): void {
    this.setState({ view: false });
    this.props.focusEditor();
  }

  /**
   * Handles when a keydown event occurs on the rendered MD cell
   */
  renderedKeyDown(e: SyntheticKeyboardEvent<*>): boolean {
    const shift = e.shiftKey;
    const ctrl = e.ctrlKey;
    if ((shift || ctrl) && e.key === "Enter") {
      this.setState({ view: true });
      return false;
    }

    switch (e.key) {
      case "ArrowUp":
        this.props.focusAbove();
        break;
      case "ArrowDown":
        this.props.focusBelow();
        break;
      case "Enter":
        this.openEditor();
        e.preventDefault();
        return false;
      default:
    }
    return true;
  }

  render(): ?React$Element<any> {
    return this.state && this.state.view ? (
      <div
        className="rendered"
        onDoubleClick={this.openEditor}
        onKeyDown={this.renderedKeyDown}
        ref={rendered => {
          this.rendered = rendered;
        }}
      >
        <LatexRenderer>
          {mdRender(
            this.state.source
              ? this.state.source
              : "*Empty markdown cell, double click me to add content.*"
          )}
        </LatexRenderer>
      </div>
    ) : (
      <div onKeyDown={this.editorKeyDown}>
        <div className="input-container">
          <div className="prompt" />
          <Editor
            language="markdown"
            id={this.props.id}
            input={this.state.source}
            theme={this.props.theme}
            focusAbove={this.props.focusAbove}
            focusBelow={this.props.focusBelow}
            cellFocused={this.props.cellFocused}
            editorFocused={this.props.editorFocused}
          />
        </div>
        <div
          className="outputs"
          ref={el => (this.outputsDiv = el)}
          onClick={this.props.clickedOutputs.bind(this)}
        >
          <LatexRenderer>{mdRender(this.state.source)}</LatexRenderer>
        </div>
      </div>
    );
  }
}
