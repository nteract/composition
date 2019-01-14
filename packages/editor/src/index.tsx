/* eslint-disable class-methods-use-this */
import * as React from "react";
import ReactDOM from "react-dom";
import { empty, of, fromEvent, merge, Subject, Observable } from "rxjs";
import { Subscription } from "rxjs";
import {
  catchError,
  debounceTime,
  map,
  partition,
  repeat,
  switchMap,
  takeUntil
} from "rxjs/operators";
import { RichestMime } from "@nteract/display-area";
import { debounce } from "lodash";
import CodeMirror, { Mode, EditorConfiguration } from "codemirror";

import excludedIntelliSenseTriggerKeys from "./excludedIntelliSenseKeys";
import { codeComplete, pick } from "./jupyter/complete";
import { tool } from "./jupyter/tooltip";
import { Options, EditorChange, CMI, CMDoc } from "./types";

export { EditorChange, Options };

import InitialTextArea from "./components/initial-text-area";

import styled from "styled-components";

import CodeMirrorCSS from "./vendored/codemirror";
import ShowHintCSS from "./vendored/show-hint";

const TipButton = styled.button`
  float: right;
  display: inline-block;
  position: absolute;
  top: 0px;
  right: 0px;
  font-size: 11.5px;
`;

const Tip = styled.div`
  padding: 20px 20px 50px 20px;
  margin: 30px 20px 50px 20px;
  box-shadow: 2px 2px 50px rgba(0, 0, 0, 0.2);
  white-space: pre-wrap;
  background-color: var(--theme-app-bg);
  z-index: 9999999;
`;

const configurableCodeMirrorOptions: {
  // Ensure we capture each of the editor configuration options
  [k in keyof EditorConfiguration]: boolean
} = {
  // Do nothing with value, we handle it above
  value: false,
  mode: true,
  // We don't allow overriding the theme as we use this to help theme codemirror
  theme: false,
  indentUnit: true,
  smartIndent: true,
  tabSize: true,
  indentWithTabs: true,
  electricChars: true,
  rtlMoveVisually: true,
  keyMap: true,
  extraKeys: true,
  lineWrapping: true,
  lineNumbers: true,
  firstLineNumber: true,
  lineNumberFormatter: true,
  gutters: true,
  fixedGutter: true,
  readOnly: true,
  showCursorWhenSelecting: true,
  undoDepth: true,
  historyEventDelay: true,
  tabindex: true,
  autofocus: true,
  dragDrop: true,
  onDragEvent: true,
  onKeyEvent: true,
  cursorBlinkRate: true,
  cursorHeight: true,
  workTime: true,
  workDelay: true,
  pollInterval: true,
  flattenSpans: true,
  maxHighlightLength: true,
  viewportMargin: true,
  lint: true,
  placeholder: true,

  // CodeMirror addon configurations
  hintOptions: false
};

function normalizeLineEndings(str: string) {
  if (!str) return str;
  return str.replace(/\r\n|\r/g, "\n");
}

function isConfigurableOption(
  props: Partial<EditorConfiguration> & { [key: string]: any }
) {}

export type CodeMirrorEditorProps = {
  editorFocused: boolean;
  completion: boolean;
  tip?: boolean;
  cursorBlinkRate: number;
  focusAbove?: () => void;
  focusBelow?: () => void;
  theme: string;
  channels?: any;
  // TODO: We only check if this is idle, so the completion provider should only
  //       care about this when kernelStatus === idle _and_ we're the active cell
  //       could instead call it `canTriggerCompletion` and reduce our current re-renders
  kernelStatus: string;
  onChange?: (value: string, change: EditorChange) => void;
  onFocusChange?: (focused: boolean) => void;
} & Partial<EditorConfiguration>;

type CodeMirrorEditorState = {
  isFocused: boolean;
  tipElement?: any;
};

type CodeCompletionEvent = {
  editor: CodeMirror.Editor;
  callback: Function;
  debounce: boolean;
};

class CodeMirrorEditor extends React.Component<
  CodeMirrorEditorProps,
  CodeMirrorEditorState
> {
  textarea?: HTMLTextAreaElement | null;
  cm: CMI;
  defaultOptions: Object;
  keyupEventsSubscriber!: Subscription;
  completionSubject!: Subject<CodeCompletionEvent>;
  completionEventsSubscriber!: Subscription;
  debounceNextCompletionRequest: boolean;

  static defaultProps: Partial<CodeMirrorEditorProps> = {
    theme: "light",
    completion: false,
    tip: false,
    kernelStatus: "not connected",
    editorFocused: false,
    channels: null,
    cursorBlinkRate: 530
  };

  textareaRef = React.createRef<HTMLTextAreaElement>();

  constructor(props: CodeMirrorEditorProps) {
    super(props);
    this.hint = this.hint.bind(this);
    (this.hint as any).async = true;
    this.tips = this.tips.bind(this);
    this.deleteTip = this.deleteTip.bind(this);
    this.debounceNextCompletionRequest = true;
    this.state = { isFocused: true, tipElement: null };

    this.defaultOptions = Object.assign({
      autoCloseBrackets: true,
      lineNumbers: false,
      matchBrackets: true,
      // This sets the class on the codemirror <div> that gets created to cm-s-composition
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
        "Ctrl-Space": (editor: CodeMirror.Editor) => {
          this.debounceNextCompletionRequest = false;
          return editor.execCommand("autocomplete");
        },
        Tab: this.executeTab,
        "Shift-Tab": (editor: CodeMirror.Editor) =>
          editor.execCommand("indentLess"),
        Up: this.goLineUpOrEmit,
        Down: this.goLineDownOrEmit,
        "Cmd-/": "toggleComment",
        "Ctrl-/": "toggleComment",
        "Cmd-.": this.tips,
        "Ctrl-.": this.tips
      },
      indentUnit: 4,
      preserveScrollPosition: false
    });
  }

  componentWillMount() {
    this.componentWillReceiveProps = debounce(
      this.componentWillReceiveProps,
      0
    );
  }

  componentDidMount(): void {
    const { completion, editorFocused, focusAbove, focusBelow } = this.props;

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
      this.textareaRef.current,
      this.defaultOptions
    );

    this.cm.setValue(this.props.value || "");

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

    // Initiate code completion in response to some keystrokes *other than* "Ctrl-Space" (which is bound in extraKeys, above)
    this.keyupEventsSubscriber = keyupEvents
      .pipe(switchMap(i => of(i)))
      .subscribe(({ editor, ev }) => {
        if (
          completion &&
          !editor.state.completionActive &&
          !excludedIntelliSenseTriggerKeys[(ev.keyCode || ev.which).toString()]
        ) {
          const cursor = editor.getDoc().getCursor();
          const token = editor.getTokenAt(cursor);
          if (
            token.type === "tag" ||
            token.type === "variable" ||
            token.string === " " ||
            token.string === "<" ||
            token.string === "/" ||
            token.string === "."
          ) {
            editor.execCommand("autocomplete");
          }
        }
      });

    this.completionSubject = new Subject();

    const [debounce, immediate] = partition(
      (ev: CodeCompletionEvent) => ev.debounce === true
    )(this.completionSubject);

    const mergedCompletionEvents = merge(
      immediate,
      debounce.pipe(
        debounceTime(150),
        takeUntil(immediate), // Upon receipt of an immediate event, cancel anything queued up from debounce.
        // This handles "type chars quickly, then quickly hit Ctrl+Space", ensuring that it
        // generates just one event rather than two.
        repeat() // Resubscribe to wait for next debounced event.
      )
    );

    const completionResults: Observable<Function> = mergedCompletionEvents.pipe(
      switchMap((ev: any) => {
        const { channels } = this.props;
        if (!channels) {
          throw new Error(
            "Unexpectedly received a completion event when channels were unset"
          );
        }
        return codeComplete(channels, ev.editor).pipe(
          map(completionResult => () => ev.callback(completionResult)),
          takeUntil(this.completionSubject), // Complete immediately upon next event, even if it's a debounced one - https://blog.strongbrew.io/building-a-safe-autocomplete-operator-with-rxjs/
          catchError((error: Error) => {
            console.log("Code completion error: " + error.message);
            return empty();
          })
        );
      })
    );

    this.completionEventsSubscriber = completionResults.subscribe(
      (callback: Function) => callback()
    );
  }

  componentDidUpdate(prevProps: CodeMirrorEditorProps): void {
    if (!this.cm) return;
    const { editorFocused, theme } = this.props;
    const { cursorBlinkRate } = this.props;

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

    if (prevProps.mode !== this.props.mode) {
      this.cm.setOption("mode", this.props.mode);
    }
  }

  componentWillReceiveProps(nextProps: CodeMirrorEditorProps) {
    if (
      this.cm &&
      nextProps.value !== undefined &&
      normalizeLineEndings(this.cm.getValue()) !==
        normalizeLineEndings(nextProps.value)
    ) {
      /*if (this.props.preserveScrollPosition) {
        var prevScrollPosition = this.cm.getScrollInfo();
        this.cm.setValue(nextProps.value);
        this.cm.scrollTo(prevScrollPosition.left, prevScrollPosition.top);
      } else {*/
      this.cm.setValue(nextProps.value);
      /*}*/
    }

    for (let optionName in nextProps) {
      // Sanity check on the properties of the props, go to next prop if this fails
      if (!nextProps.hasOwnProperty(optionName)) {
        continue;
      }

      // NOTE: This is playing loose with types, with the expectation we'll check for anything untrue on our
      // .     configurable setup
      const configurable =
        configurableCodeMirrorOptions[optionName as keyof EditorConfiguration];
      if (!configurable) {
        continue;
      }
      const validOptionName = optionName as keyof EditorConfiguration;

      // We can now assume `optionName` is one of EditorConfiguration's valid keys for propagating
      this.cm.setOption(validOptionName, nextProps[validOptionName]);

      switch (optionName) {
        case "mode":
        case "indentUnit":
        case "smartIndent":
        case "tabSize":
        case "indentWithTabs":
        case "electricChars":
        case "rtlMoveVisually":
        case "lineWrapping":
        case "lineNumbers":
        case "firstLineNumber":
        case "readOnly":
          this.cm.setOption(optionName, nextProps[optionName]);
        // Do nothing with value, we handle it above
        case "value":
        // This is our theme prop (for light or dark, not a codemirror theme)
        case "theme":
          break;
      }
    }
  }

  componentWillUnmount() {
    // TODO: is there a lighter weight way to remove the codemirror instance?
    if (this.cm) {
      this.cm.toTextArea();
    }
    this.keyupEventsSubscriber.unsubscribe();
    this.completionEventsSubscriber.unsubscribe();
  }

  focusChanged(focused: boolean) {
    this.setState({
      isFocused: focused
    });
    this.props.onFocusChange && this.props.onFocusChange(focused);
  }

  hint(editor: CodeMirror.Editor, callback: Function): void {
    const { completion, channels } = this.props;
    const debounceThisCompletionRequest = this.debounceNextCompletionRequest;
    this.debounceNextCompletionRequest = true;
    if (completion && channels) {
      const el = {
        editor: editor,
        callback: callback,
        debounce: debounceThisCompletionRequest
      };
      this.completionSubject.next(el);
    }
  }

  deleteTip() {
    this.setState({ tipElement: null });
  }

  // TODO: Rely on ReactDOM.createPortal, create a space for tooltips to go
  tips(editor: CodeMirror.Editor & CodeMirror.Doc): void {
    const { tip, channels } = this.props;

    if (tip) {
      tool(channels, editor).subscribe((resp: { [dict: string]: any }) => {
        const bundle = resp.dict;

        if (Object.keys(bundle).length === 0) {
          return;
        }

        const node = document.getElementsByClassName(
          "tip-holder"
        )[0] as HTMLElement;

        const tipElement = ReactDOM.createPortal(
          <Tip className="CodeMirror-hint">
            <RichestMime bundle={bundle} metadata={{ expanded: true }} />
            <TipButton onClick={this.deleteTip}>{`\u2715`}</TipButton>
          </Tip>,
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

  goLineDownOrEmit(editor: CodeMirror.Doc & CodeMirror.Editor): void {
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

  goLineUpOrEmit(editor: CodeMirror.Doc & CodeMirror.Editor): void {
    const cursor = editor.getCursor();
    if (cursor.line === 0 && cursor.ch === 0 && !editor.somethingSelected()) {
      const CM = require("codemirror");
      CM.signal(editor, "topBoundary");
    } else {
      editor.execCommand("goLineUp");
    }
  }

  executeTab(editor: CodeMirror.Doc & CodeMirror.Editor): void {
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

  render() {
    return (
      <React.Fragment>
        {/* Global CodeMirror CSS packaged up by styled-components */}
        <CodeMirrorCSS />
        <ShowHintCSS />

        <div className="tip-holder" />
        <InitialTextArea
          ref={this.textareaRef}
          defaultValue={this.props.value}
        />
        {/* CodeMirror will inject a div right below the TextArea above */}
        {this.state.tipElement}
      </React.Fragment>
    );
  }
}

export default CodeMirrorEditor;
