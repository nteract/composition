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

import { debounce } from "lodash";

import type { EditorChange, ScrollInfo, CMI, CMDoc } from "./types";

function normalizeLineEndings(str) {
  if (!str) return str;
  return str.replace(/\r\n|\r/g, "\n");
}

type CodeMirrorProps = {
  codeMirrorInstance?: any,
  defaultValue?: string,
  onChange: (value: string, change: EditorChange) => void,
  onFocusChange: (focused: boolean) => void,
  onScroll: (scrollInfo: ScrollInfo) => any,
  options: any,
  path?: string,
  value: string,
  preserveScrollPosition: boolean
};

class CodeMirror extends React.Component<CodeMirrorProps, *> {
  static defaultProps = {
    preserveScrollPosition: false,
    onScroll: () => {}
  };

  textarea: ?HTMLTextAreaElement;
  codeMirror: CMI;

  constructor(props: CodeMirrorProps) {
    super(props);
    (this: any).getCodeMirrorLibrary = this.getCodeMirrorLibrary.bind(this);
    (this: any).scrollChanged = this.scrollChanged.bind(this);
    (this: any).focus = this.focus;
    (this: any).codemirrorValueChanged = this.codemirrorValueChanged;
    (this: any).getCodeMirror = this.getCodeMirror;
    this.state = {
      isFocused: false
    };
  }

  componentWillMount() {
    (this: any).componentWillReceiveProps = debounce(
      this.componentWillReceiveProps,
      0
    );
  }

  componentDidMount() {
    const textareaNode = this.textarea;
    const codeMirrorInstance = this.getCodeMirrorLibrary();

    this.codeMirror = codeMirrorInstance.fromTextArea(
      this.textarea,
      this.props.options
    );
    this.codeMirror.on("change", this.codemirrorValueChanged.bind(this));
    this.codeMirror.on("scroll", this.scrollChanged.bind(this));
    this.codeMirror.setValue(this.props.defaultValue || this.props.value || "");
  }

  componentWillUnmount() {
    // TODO: is there a lighter weight way to remove the codemirror instance
    if (this.codeMirror) {
      this.codeMirror.toTextArea();
    }
  }

  componentWillReceiveProps(nextProps: CodeMirrorProps) {
    if (
      this.codeMirror &&
      nextProps.value !== undefined &&
      normalizeLineEndings(this.codeMirror.getValue()) !==
        normalizeLineEndings(nextProps.value)
    ) {
      if (this.props.preserveScrollPosition) {
        var prevScrollPosition = this.codeMirror.getScrollInfo();
        this.codeMirror.setValue(nextProps.value);
        this.codeMirror.scrollTo(
          prevScrollPosition.left,
          prevScrollPosition.top
        );
      } else {
        this.codeMirror.setValue(nextProps.value);
      }
    }
    if (typeof nextProps.options === "object") {
      for (let optionName in nextProps.options) {
        if (nextProps.options.hasOwnProperty(optionName)) {
          this.codeMirror.setOption(optionName, nextProps.options[optionName]);
        }
      }
    }
  }

  getCodeMirrorLibrary() {
    return this.props.codeMirrorInstance || require("codemirror");
  }

  getCodeMirror() {
    return this.codeMirror;
  }

  focus() {
    if (this.codeMirror) {
      this.codeMirror.focus();
    }
  }

  scrollChanged(cm: CMI) {
    this.props.onScroll(cm.getScrollInfo());
  }

  codemirrorValueChanged(doc: CMDoc, change: EditorChange) {
    if (this.props.onChange && change.origin !== "setValue") {
      this.props.onChange(doc.getValue(), change);
    }
  }

  render() {
    return (
      <textarea
        ref={ta => {
          this.textarea = ta;
        }}
        name={this.props.path}
        defaultValue={this.props.value}
        autoComplete="off"
        className="CodeMirror-code initialTextAreaForCodeMirror"
      />
    );
  }
}

type WrapperProps = {
  id: string,
  input: any,
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
  onChange: (text: string) => void,
  onFocusChange: (focused: boolean) => void
};

type CodeMirrorEditorState = {
  isFocused: boolean
};

class CodeMirrorEditor extends React.Component<
  WrapperProps,
  CodeMirrorEditorState
> {
  codemirror: ?Object;
  getCodeMirrorOptions: (p: WrapperProps) => Object;
  goLineUpOrEmit: (editor: Object) => void;
  goLineDownOrEmit: (editor: Object) => void;
  executeTab: (editor: Object) => void;
  hint: (editor: Object, cb: Function) => void;
  tips: (editor: Object) => void;

  constructor(props: WrapperProps): void {
    super((props: WrapperProps));
    this.hint = this.completions.bind(this);
    this.tips = this.tips.bind(this);
    this.hint.async = true;

    (this: any).focusChanged = this.focusChanged;

    this.state = {
      isFocused: false
    };
  }

  componentDidMount(): void {
    if (!this.codemirror) return;
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

    const cm = this.codemirror.getCodeMirror();

    // On first load, if focused, set codemirror to focus
    if (editorFocused && this.codemirror) {
      this.codemirror.focus();
    }

    cm.on("topBoundary", focusAbove);
    cm.on("bottomBoundary", focusBelow);

    cm.on("focus", this.focusChanged.bind(this, true));
    cm.on("blur", this.focusChanged.bind(this, false));

    const keyupEvents = fromEvent(cm, "keyup", (editor, ev) => ({
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
    if (!this.codemirror) return;
    const cm = this.codemirror.getCodeMirror();
    const { cursorBlinkRate, editorFocused, theme } = this.props;

    if (prevProps.theme !== theme) {
      cm.refresh();
    }

    if (prevProps.editorFocused !== editorFocused) {
      editorFocused && this.codemirror
        ? this.codemirror.focus()
        : cm.getInputField().blur();
    }

    if (prevProps.cursorBlinkRate !== cursorBlinkRate) {
      cm.setOption("cursorBlinkRate", cursorBlinkRate);
      if (editorFocused) {
        // code mirror doesn't change the blink rate immediately, we have to
        // move the cursor, or unfocus and refocus the editor to get the blink
        // rate to update - so here we do that (unfocus and refocus)
        cm.getInputField().blur();
        cm.focus();
      }
    }
  }

  focusChanged(focused: boolean) {
    this.setState({
      isFocused: focused
    });
    this.props.onFocusChange && this.props.onFocusChange(focused);
  }

  completions(editor: Object, callback: Function): void {
    const { completion, channels } = this.props;
    if (completion) {
      codeComplete(channels, editor).subscribe(callback);
    }
  }

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

  getCodeMirrorOptions({ cursorBlinkRate, language }: WrapperProps): Object {
    return {
      autoCloseBrackets: true,
      mode: language || "python",
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
      cursorBlinkRate
    };
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

  render(): React$Element<any> {
    const { input, onChange, onFocusChange } = this.props;
    const options = this.getCodeMirrorOptions(this.props);

    const editorClassName = classNames(
      "ReactCodeMirror",
      this.state.isFocused ? "ReactCodeMirror--focused" : null,
      "cell_cm"
    );

    return (
      <div className="input">
        <div className={editorClassName}>
          <div className="CodeMirror cm-s-composition CodeMirror-wrap">
            <CodeMirror
              value={input}
              ref={el => {
                this.codemirror = el;
              }}
              options={options}
              onChange={onChange}
              onClick={() => {
                if (this.codemirror) this.codemirror.focus();
              }}
              onFocusChange={onFocusChange}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default CodeMirrorEditor;
