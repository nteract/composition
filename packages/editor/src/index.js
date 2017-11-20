// @flow
/* eslint-disable class-methods-use-this */
import * as React from "react";
import ReactDOM from "react-dom";

import { of } from "rxjs/observable/of";
import { fromEvent } from "rxjs/observable/fromEvent";
import { switchMap } from "rxjs/operators";

import { Map as ImmutableMap } from "immutable";

import { transforms } from "@nteract/transforms";

import excludedIntelliSenseTriggerKeys from "./excludedIntelliSenseKeys";

import { codeComplete, pick } from "./jupyter/complete";
import { tool } from "./jupyter/tooltip";

import classNames from "classnames";

import { debounce, merge } from "lodash";

import type { EditorChange, ScrollInfo, CMI, CMDoc } from "./types";

function normalizeLineEndings(str) {
  if (!str) return str;
  return str.replace(/\r\n|\r/g, "\n");
}

type WrapperProps = {
  id: string,
  editorFocused: boolean,
  cellFocused: boolean,
  completion: boolean,
  tip: boolean,
  focusAbove: () => void,
  focusBelow: () => void,
  theme: string,
  channels: any,
  cursorBlinkRate: number,
  executionState: "idle" | "starting" | "not connected",
  language: string,
  onChange: (value: string, change: EditorChange) => void,
  onFocusChange: (focused: boolean) => void,
  onScroll: (scrollInfo: ScrollInfo) => any,
  preserveScrollPosition: boolean,
  value: string,
  defaultValue?: string,
  options: any
};

type CodeMirrorEditorState = {
  isFocused: boolean
};

class CodeMirrorEditor extends React.Component<
  WrapperProps,
  CodeMirrorEditorState
> {
  textarea: ?HTMLTextAreaElement;
  cm: CMI;
  defaultOptions: Object;
  goLineUpOrEmit: (editor: Object) => void;
  goLineDownOrEmit: (editor: Object) => void;
  executeTab: (editor: Object) => void;
  hint: (editor: Object, cb: Function) => void;
  tips: (editor: Object) => void;

  static defaultProps = {
    // Workaround a flow limitation
    onScroll: () => {}
  };

  constructor(props: WrapperProps): void {
    super(props);
    this.hint = this.completions.bind(this);
    this.tips = this.tips.bind(this);
    this.hint.async = true;

    (this: any).scrollChanged = this.scrollChanged.bind(this);
    (this: any).focusChanged = this.focusChanged;
    (this: any).codemirrorValueChanged = this.codemirrorValueChanged;

    this.state = {
      isFocused: false
    };

    // TODO: Merge in default options with custom options
    // For now we'll do the old way of passing it in below
    // Which means we likely won't respond to updates properly
    this.defaultOptions = {
      autoCloseBrackets: true,
      mode: props.language || "python",
      lineNumbers: false,
      matchBrackets: true,
      theme: "composition",
      autofocus: false,
      hintOptions: {
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
      cursorBlinkRate: props.cursorBlinkRate
    };
  }

  componentWillMount() {
    (this: any).componentWillReceiveProps = debounce(
      this.componentWillReceiveProps,
      0
    );
  }

  componentDidMount(): void {
    const {
      editorFocused,
      executionState,
      focusAbove,
      focusBelow
    } = this.props;

    require("codemirror/addon/hint/show-hint");
    require("codemirror/addon/hint/anyword-hint");
    require("codemirror/addon/search/search");
    require("codemirror/addon/search/searchcursor");
    require("codemirror/addon/edit/matchbrackets");
    require("codemirror/addon/edit/closebrackets");
    require("codemirror/addon/dialog/dialog");
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
      merge({}, this.props.options, this.defaultOptions)
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
    this.cm.on("scroll", this.scrollChanged.bind(this));
    this.cm.on("change", this.codemirrorValueChanged.bind(this));

    const keyupEvents = fromEvent(this.cm, "keyup", (editor, ev) => ({
      editor,
      ev
    }));

    keyupEvents.pipe(switchMap(i => of(i))).subscribe(({ editor, ev }) => {
      const cursor = editor.getDoc().getCursor();
      const token = editor.getTokenAt(cursor);

      if (
        !editor.state.completionActive &&
        !excludedIntelliSenseTriggerKeys[(ev.keyCode || ev.which).toString()] &&
        (token.type === "tag" ||
          token.type === "variable" ||
          token.string === " " ||
          token.string === "<" ||
          token.string === "/") &&
        executionState === "idle"
      ) {
        editor.execCommand("autocomplete", { completeSingle: false });
      }
    });
  }

  componentDidUpdate(prevProps: WrapperProps): void {
    if (!this.cm) return;
    const { cursorBlinkRate, editorFocused, theme } = this.props;

    if (prevProps.theme !== theme) {
      this.cm.refresh();
    }

    if (prevProps.editorFocused !== editorFocused) {
      editorFocused ? this.cm.focus() : this.cm.getInputField().blur();
    }

    if (prevProps.cursorBlinkRate !== cursorBlinkRate) {
      this.cm.setOption("cursorBlinkRate", cursorBlinkRate);
      if (editorFocused) {
        // code mirror doesn't change the blink rate immediately, we have to
        // move the cursor, or unfocus and refocus the editor to get the blink
        // rate to update - so here we do that (unfocus and refocus)
        this.cm.getInputField().blur();
        this.cm.focus();
      }
    }
  }

  componentWillReceiveProps(nextProps: WrapperProps) {
    if (
      this.cm &&
      nextProps.value !== undefined &&
      normalizeLineEndings(this.cm.getValue()) !==
        normalizeLineEndings(nextProps.value)
    ) {
      if (this.props.preserveScrollPosition) {
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
  }

  focusChanged(focused: boolean) {
    this.setState({
      isFocused: focused
    });
    this.props.onFocusChange && this.props.onFocusChange(focused);
  }

  scrollChanged(cm: CMI) {
    this.props.onScroll(cm.getScrollInfo());
  }

  completions(editor: Object, callback: Function): void {
    const { completion, channels } = this.props;
    if (completion) {
      codeComplete(channels, editor).subscribe(callback);
    }
  }

  // Could this be a component that uses the React Portal API? There might be a
  // nice declarative compound interface we could use too...
  tips(editor: Object): void {
    const { tip, channels } = this.props;
    const currentTip = document.getElementById("cl");
    const body = document.body;
    if (currentTip && body != null) {
      body.removeChild(currentTip);
      editor.setSize("auto", "auto");
      return;
    }
    if (tip) {
      tool(channels, editor).subscribe(resp => {
        const bundle = ImmutableMap(resp.dict);
        if (bundle.size === 0) {
          return;
        }
        const mimetype = "text/plain";
        // $FlowFixMe: until transforms refactored for new export interface GH #1488
        const Transform = transforms.get(mimetype);
        const node = document.createElement("div");
        node.className = "CodeMirror-hint tip";
        node.id = "cl";
        ReactDOM.render(<Transform data={bundle.get(mimetype)} />, node);
        const node2 = document.createElement("button");
        node2.className = "bt";
        node2.id = "btnid";
        node2.textContent = "\u2715";
        node2.style.fontSize = "11.5px";
        node.appendChild(node2);
        node2.onclick = function removeButton() {
          this.parentNode.parentNode.removeChild(this.parentNode);
          return false;
        };
        editor.addWidget({ line: editor.getCursor().line, ch: 0 }, node, true);
        const x = document.getElementById("cl");
        if (x != null && body != null) {
          const pos = x.getBoundingClientRect();
          body.appendChild(x);
          x.style.top = pos.top + "px";
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
      // $FlowFixMe: fix the flow definition for signal on a commonjs import
      CM.signal(editor, "bottomBoundary");
    } else {
      editor.execCommand("goLineDown");
    }
  }

  goLineUpOrEmit(editor: Object): void {
    const cursor = editor.getCursor();
    if (cursor.line === 0 && cursor.ch === 0 && !editor.somethingSelected()) {
      const CM = require("codemirror");
      // $FlowFixMe: fix the flow definition for signal on a commonjs import
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
    if (this.props.onChange && change.origin !== "setValue") {
      this.props.onChange(doc.getValue(), change);
    }
  }

  render(): React$Element<any> {
    const editorClassName = classNames(
      "ReactCodeMirror",
      this.state.isFocused ? "ReactCodeMirror--focused" : null,
      "cell_cm"
    );

    return (
      <div className="input">
        <div className={editorClassName}>
          <div className="CodeMirror cm-s-composition CodeMirror-wrap">
            <textarea
              ref={ta => {
                this.textarea = ta;
              }}
              defaultValue={this.props.value}
              autoComplete="off"
              className="CodeMirror-code initialTextAreaForCodeMirror"
            />
          </div>
        </div>
      </div>
    );
  }
}

export default CodeMirrorEditor;
