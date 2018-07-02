// @flow
/* eslint-disable class-methods-use-this */
import * as React from "react";
import ReactDOM from "react-dom";

import { of, fromEvent } from "rxjs";
import type { Subscription } from "rxjs";
import { switchMap } from "rxjs/operators";

import { Map as ImmutableMap } from "immutable";

import { RichestMime } from "@nteract/display-area";

import excludedIntelliSenseTriggerKeys from "./excludedIntelliSenseKeys";

import { codeComplete, pick } from "./jupyter/complete";
import { tool } from "./jupyter/tooltip";

import { debounce, merge } from "lodash";

import type { Options, EditorChange, ScrollInfo, CMI, CMDoc } from "./types";
export type { EditorChange, Options };

import styles from "./styles";

import codemirrorStyles from "./vendored/codemirror";
import showHintStyles from "./vendored/show-hint";

function normalizeLineEndings(str) {
  if (!str) return str;
  return str.replace(/\r\n|\r/g, "\n");
}

export type CodeMirrorEditorProps = {
  editorFocused: boolean,
  completion: boolean,
  tip?: boolean,
  focusAbove?: () => void,
  focusBelow?: () => void,
  theme: string,
  channels?: ?any,
  // TODO: We only check if this is idle, so the completion provider should only
  //       care about this when kernelStatus === idle _and_ we're the active cell
  //       could instead call it `canTriggerCompletion` and reduce our current re-renders
  kernelStatus: string,
  onChange: (value: string, change: EditorChange) => void,
  onFocusChange: ?(focused: boolean) => void,
  value: string,
  defaultValue?: string,
  options: Options
};

type CodeMirrorEditorState = {
  isFocused: boolean,
  tipElement: ?any
};

class CodeMirrorEditor extends React.Component<
  CodeMirrorEditorProps,
  CodeMirrorEditorState
> {
  textarea: ?HTMLTextAreaElement;
  cm: CMI;
  defaultOptions: Object;
  keyupEventsSubscriber: Subscription;

  static defaultProps = {
    theme: "light",
    completion: false,
    tip: false,
    kernelStatus: "not connected",
    onChange: null,
    onFocusChange: null,
    options: {},
    editorFocused: false,
    channels: null
  };

  constructor(props: CodeMirrorEditorProps): void {
    super(props);
    (this: any).hint = this.completions.bind(this);
    (this: any).tips = this.tips.bind(this);
    (this: any).deleteTip = this.deleteTip.bind(this);
    // $FlowFixMe: weirdness in the codemirror API
    this.hint.async = true;
    this.state = { isFocused: true, tipElement: null };

    this.defaultOptions = Object.assign(
      {
        autoCloseBrackets: true,
        lineNumbers: false,
        matchBrackets: true,
        theme: "composition",
        autofocus: false,
        hintOptions: {
          // $FlowFixMe: weirdness in the codemirror API
          hint: this.hint,
          completeSingle: false, // In automatic autocomplete mode we don't want override
          extraKeys: {
            Right: pick
          }
        },
        extraKeys: {
          "Ctrl-Space": "autocomplete",
          Tab: this.executeTab,
          "Shift-Tab": editor => editor.execCommand("indentLess"),
          Up: this.goLineUpOrEmit,
          Down: this.goLineDownOrEmit,
          "Cmd-/": "toggleComment",
          "Ctrl-/": "toggleComment",
          "Cmd-.": this.tips,
          "Ctrl-.": this.tips
        },
        indentUnit: 4,
        preserveScrollPosition: false
      },
      props.options
    );
  }

  componentWillMount() {
    (this: any).componentWillReceiveProps = debounce(
      this.componentWillReceiveProps,
      0
    );
  }

  componentDidMount(): void {
    const { editorFocused, kernelStatus, focusAbove, focusBelow } = this.props;

    require("codemirror/addon/hint/show-hint");
    require("codemirror/addon/hint/anyword-hint");

    require("codemirror/addon/edit/matchbrackets");
    require("codemirror/addon/edit/closebrackets");

    require("codemirror/addon/comment/comment.js");

    require("codemirror/mode/python/python");
    require("codemirror/mode/ruby/ruby");
    require("codemirror/mode/javascript/javascript");
    require("codemirror/mode/css/css");
    require("codemirror/mode/julia/julia");
    require("codemirror/mode/r/r");
    require("codemirror/mode/clike/clike");
    require("codemirror/mode/shell/shell");
    require("codemirror/mode/sql/sql");
    require("codemirror/mode/markdown/markdown");
    require("codemirror/mode/gfm/gfm");

    require("./mode/ipython");

    this.cm = require("codemirror").fromTextArea(
      this.textarea,
      this.defaultOptions
    );

    this.cm.setValue(this.props.defaultValue || this.props.value || "");

    // On first load, if focused, set codemirror to focus
    if (editorFocused) {
      this.cm.focus();
    }

    this.cm.on("topBoundary", focusAbove);
    this.cm.on("bottomBoundary", focusBelow);

    this.cm.on("focus", this.focusChanged.bind(this, true));
    this.cm.on("blur", this.focusChanged.bind(this, false));
    this.cm.on("change", this.codemirrorValueChanged.bind(this));

    const keyupEvents = fromEvent(this.cm, "keyup", (editor, ev) => ({
      editor,
      ev
    }));

    this.keyupEventsSubscriber = keyupEvents
      .pipe(switchMap(i => of(i)))
      .subscribe(({ editor, ev }) => {
        const cursor = editor.getDoc().getCursor();
        const token = editor.getTokenAt(cursor);

        if (
          !editor.state.completionActive &&
          !excludedIntelliSenseTriggerKeys[
            (ev.keyCode || ev.which).toString()
          ] &&
          (token.type === "tag" ||
            token.type === "variable" ||
            token.string === " " ||
            token.string === "<" ||
            token.string === "/") &&
          kernelStatus === "idle"
        ) {
          editor.execCommand("autocomplete", { completeSingle: false });
        }
      });
  }

  componentDidUpdate(prevProps: CodeMirrorEditorProps): void {
    if (!this.cm) return;
    const { editorFocused, theme } = this.props;
    const { cursorBlinkRate } = this.props.options;

    if (prevProps.theme !== theme) {
      this.cm.refresh();
    }

    if (prevProps.editorFocused !== editorFocused) {
      editorFocused ? this.cm.focus() : this.cm.getInputField().blur();
    }

    if (prevProps.options.cursorBlinkRate !== cursorBlinkRate) {
      this.cm.setOption("cursorBlinkRate", cursorBlinkRate);
      if (editorFocused) {
        // code mirror doesn't change the blink rate immediately, we have to
        // move the cursor, or unfocus and refocus the editor to get the blink
        // rate to update - so here we do that (unfocus and refocus)
        this.cm.getInputField().blur();
        this.cm.focus();
      }
    }

    if (prevProps.options.mode !== this.props.options.mode) {
      this.cm.setOption("mode", this.props.options.mode);
    }
  }

  componentWillReceiveProps(nextProps: CodeMirrorEditorProps) {
    if (
      this.cm &&
      nextProps.value !== undefined &&
      normalizeLineEndings(this.cm.getValue()) !==
        normalizeLineEndings(nextProps.value)
    ) {
      if (this.props.options.preserveScrollPosition) {
        var prevScrollPosition = this.cm.getScrollInfo();
        this.cm.setValue(nextProps.value);
        this.cm.scrollTo(prevScrollPosition.left, prevScrollPosition.top);
      } else {
        this.cm.setValue(nextProps.value);
      }
    }
    if (typeof nextProps.options === "object") {
      for (let optionName in nextProps.options) {
        if (
          nextProps.options.hasOwnProperty(optionName) &&
          this.props.options[optionName] === nextProps.options[optionName]
        ) {
          this.cm.setOption(optionName, nextProps.options[optionName]);
        }
      }
    }
  }

  componentWillUnmount() {
    // TODO: is there a lighter weight way to remove the codemirror instance?
    if (this.cm) {
      this.cm.toTextArea();
    }
    this.keyupEventsSubscriber.unsubscribe();
  }

  focusChanged(focused: boolean) {
    this.setState({
      isFocused: focused
    });
    this.props.onFocusChange && this.props.onFocusChange(focused);
  }

  completions(editor: Object, callback: Function): void {
    const { completion, channels } = this.props;
    if (completion && channels) {
      codeComplete(channels, editor).subscribe(callback);
    }
  }

  deleteTip() {
    this.setState({ tipElement: null });
  }

  // TODO: Rely on ReactDOM.createPortal, create a space for tooltips to go
  tips(editor: Object): void {
    const { tip, channels } = this.props;

    if (tip) {
      tool(channels, editor).subscribe(resp => {
        const bundle = resp.dict;

        if (Object.keys(bundle).length === 0) {
          return;
        }

        const node = document.getElementsByClassName("tip-holder")[0];

        const tipElement = ReactDOM.createPortal(
          <div className="CodeMirror-hint tip">
            <RichestMime bundle={bundle} expanded />
            <button className="bt" onClick={this.deleteTip}>{`\u2715`}</button>
            <style jsx>{`
              .bt {
                float: right;
                display: inline-block;
                position: absolute;
                top: 0px;
                right: 0px;
                font-size: 11.5px;
              }

              .tip {
                padding: 20px 20px 50px 20px;
                margin: 30px 20px 50px 20px;
                box-shadow: 2px 2px 50px rgba(0, 0, 0, 0.2);
                white-space: pre-wrap;
                background-color: var(--theme-app-bg);
                z-index: 9999999;
              }
            `}</style>
          </div>,
          node
        );

        this.setState({ tipElement });

        editor.addWidget({ line: editor.getCursor().line, ch: 0 }, node, true);

        const body = document.body;
        if (node != null && body != null) {
          const pos = node.getBoundingClientRect();
          body.appendChild(node);
          node.style.top = pos.top + "px";
        }
      });
    }
  }

  goLineDownOrEmit(editor: Object): void {
    const cursor = editor.getCursor();
    const lastLineNumber = editor.lastLine();
    const lastLine = editor.getLine(lastLineNumber);
    if (
      cursor.line === lastLineNumber &&
      cursor.ch === lastLine.length &&
      !editor.somethingSelected()
    ) {
      const CM = require("codemirror");
      CM.signal(editor, "bottomBoundary");
    } else {
      editor.execCommand("goLineDown");
    }
  }

  goLineUpOrEmit(editor: Object): void {
    const cursor = editor.getCursor();
    if (cursor.line === 0 && cursor.ch === 0 && !editor.somethingSelected()) {
      const CM = require("codemirror");
      CM.signal(editor, "topBoundary");
    } else {
      editor.execCommand("goLineUp");
    }
  }

  executeTab(editor: Object): void {
    editor.somethingSelected()
      ? editor.execCommand("indentMore")
      : editor.execCommand("insertSoftTab");
  }

  codemirrorValueChanged(doc: CMDoc, change: EditorChange) {
    if (
      this.props.onChange &&
      // When the change came from us setting the value, don't trigger another change
      change.origin !== "setValue"
    ) {
      this.props.onChange(doc.getValue(), change);
    }
  }

  render(): React$Element<any> {
    return (
      <div className="CodeMirror cm-s-composition ">
        <div className="tip-holder" />
        <textarea
          ref={ta => {
            this.textarea = ta;
          }}
          defaultValue={this.props.value}
          autoComplete="off"
          className="initialTextAreaForCodeMirror"
        />
        <style jsx>{showHintStyles}</style>
        <style jsx>{codemirrorStyles}</style>
        <style jsx>{styles}</style>
        {this.state.tipElement}
      </div>
    );
  }
}

export default CodeMirrorEditor;
