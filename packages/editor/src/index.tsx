import { MediaBundle } from "@nteract/commutable";
import { Channels } from "@nteract/messaging";
import CodeMirror, {
  Doc,
  Editor,
  EditorChangeLinkedList,
  EditorFromTextArea,
  Position
} from "codemirror";

import { FullEditorConfiguration, isConfigurable } from "./configurable";

import * as React from "react";
import ReactDOM from "react-dom";
import { empty, merge, Observable, Subject, Subscription } from "rxjs";
import {
  catchError,
  debounceTime,
  map,
  partition,
  repeat,
  switchMap,
  takeUntil
} from "rxjs/operators";

import { codeComplete, pick } from "./jupyter/complete";
import { tool } from "./jupyter/tooltip";

import { InitialTextArea } from "./components/initial-text-area";
import { Tooltip } from "./components/tooltip";

import CodeMirrorCSS from "./vendored/codemirror";
import ShowHintCSS from "./vendored/show-hint";

import isEqual from "lodash.isequal";

export { CodeMirrorCSS, ShowHintCSS };

function normalizeLineEndings(str: string): string {
  if (!str) {
    return str;
  }
  return str.replace(/\r\n|\r/g, "\n");
}
export interface EditorKeyEvent {
  editor: Editor;
  ev: KeyboardEvent;
}

export type CodeMirrorEditorProps = {
  autofocus: boolean;
  preserveScrollPosition: boolean;
  editorFocused: boolean;
  completion: boolean;
  tip?: boolean;
  focusAbove?: (instance: Editor) => void;
  focusBelow?: (instance: Editor) => void;
  channels?: Channels | null;
  /**
   * We use the kernelStatus to check to see if the kernel is currently
   * idle. If the kernel is idle, then we can send over a completion_request
   * to the kernel.
   */
  kernelStatus: string;
  onChange?: (value: string, change: EditorChangeLinkedList) => void;
  onFocusChange?: (focused: boolean) => void;
  value: string;
  editorType: "codemirror";
  codeMirror: FullEditorConfiguration;
};

interface CodeMirrorEditorState {
  bundle: MediaBundle | null;
  cursorCoords: { top: number; left: number; bottom: number } | null;
}

interface CodeCompletionEvent {
  editor: Editor & Doc;
  callback: (completionResult: any) => {};
  debounce: boolean;
}

type Mode = {
  name: string
}

export default class CodeMirrorEditor extends React.Component<
  CodeMirrorEditorProps,
  CodeMirrorEditorState
  > {
  static defaultProps: Partial<CodeMirrorEditorProps> = {
    value: "",
    channels: null,
    completion: false,
    editorFocused: false,
    kernelStatus: "not connected",
    tip: false,
    autofocus: false,
    editorType: "codemirror",
    // CodeMirror specific options for defaults
    codeMirror: {
      matchBrackets: true,
      autoCloseBrackets: false,
      indentUnit: 4,
      tabSize: 4,
      lineNumbers: false,
      smartIndent: true,
      cursorBlinkRate: 530,
      showCursorWhenSelecting: true
    }
  };

  textarea?: HTMLTextAreaElement | null;
  cm!: EditorFromTextArea;
  defaultOptions: FullEditorConfiguration;
  completionSubject!: Subject<CodeCompletionEvent>;
  completionEventsSubscriber!: Subscription;
  debounceNextCompletionRequest: boolean;

  textareaRef: React.RefObject<HTMLTextAreaElement> = React.createRef<
    HTMLTextAreaElement
  >();
  tooltipNode: HTMLDivElement | null = null;

  constructor(props: CodeMirrorEditorProps) {
    super(props);
    this.hint = this.hint.bind(this);
    (this.hint as any).async = true;
    this.tips = this.tips.bind(this);
    this.deleteTip = this.deleteTip.bind(this);
    this.debounceNextCompletionRequest = true;
    this.state = {
      bundle: null,
      cursorCoords: null
    };

    this.fullOptions = this.fullOptions.bind(this);
    this.cleanMode = this.cleanMode.bind(this);
    this.loadMode = this.loadMode.bind(this);

    // Bind our events to codemirror
    const extraKeys = {
      "Cmd-.": this.tips,
      "Cmd-/": "toggleComment",
      "Ctrl-.": this.tips,
      "Ctrl-/": "toggleComment",
      "Ctrl-Space": (editor: Editor) => {
        this.debounceNextCompletionRequest = false;
        return editor.execCommand("autocomplete");
      },
      Down: this.goLineDownOrEmit,
      "Shift-Tab": (editor: Editor) => editor.execCommand("indentLess"),
      Tab: this.executeTab,
      Up: this.goLineUpOrEmit,
      Esc: this.deleteTip
    };

    const hintOptions = {
      // In automatic autocomplete mode we don't want override
      completeSingle: false,
      extraKeys: {
        Right: pick
      },
      hint: this.hint
    };

    this.defaultOptions = Object.assign({
      extraKeys,
      hintOptions,
      // This sets the class on the codemirror <div> that gets created to
      // cm-s-composition
      theme: "composition",
      lineWrapping: true
    });
  }

  fullOptions(defaults: FullEditorConfiguration = {}) {
    // Only pass to codemirror the options we support
    return Object.keys(this.props.codeMirror)
      .filter(isConfigurable)
      .reduce((obj, key) => {
        obj[key] = this.props.codeMirror[key];
        return obj;
      }, defaults);
  }

  cleanMode(): string | Mode {
    if (!this.props.codeMirror.mode) {
      return "text/plain";
    }
    if (typeof this.props.codeMirror.mode === "string") {
      return this.props.codeMirror.mode;
    }
    // If the mode comes in as an immutable map, convert it first
    if (
      typeof this.props.codeMirror.mode === "object" &&
      "toJS" in this.props.codeMirror.mode
    ) {
      return this.props.codeMirror.mode.toJS();
    }
    return this.props.codeMirror.mode;
  }

  async loadMode(): Promise<string | Mode> {
    let mode = this.cleanMode();
    mode = typeof mode === "string" ? mode : mode.name;

    if (CodeMirror.modes.hasOwnProperty(mode)) {
      return mode;
    }

    await import(`codemirror/mode/${mode}/${mode}.js`)

    return mode;
  }

  componentDidMount(): void {
    require("codemirror/addon/hint/show-hint");
    require("codemirror/addon/hint/anyword-hint");

    require("codemirror/addon/edit/matchbrackets");
    require("codemirror/addon/edit/closebrackets");

    require("codemirror/addon/comment/comment");

    require("codemirror/mode/python/python");
    require("codemirror/mode/ruby/ruby");
    require("codemirror/mode/javascript/javascript");
    require("codemirror/mode/elm/elm");
    require("codemirror/mode/css/css");
    require("codemirror/mode/julia/julia");
    require("codemirror/mode/r/r");
    require("codemirror/mode/clike/clike");
    require("codemirror/mode/shell/shell");
    require("codemirror/mode/sql/sql");
    require("codemirror/mode/markdown/markdown");
    require("codemirror/mode/gfm/gfm");
    require("codemirror/mode/go/go");
    require("codemirror/mode/powershell/powershell");
    require("codemirror/mode/mllike/mllike");
    require("codemirror/mode/rust/rust");

    require("./mode/ipython");
    require("./mode/nim");

    const { editorFocused, focusAbove, focusBelow } = this.props;

    // ensure a single tooltip holder exists on document.body
    const tipHolder = document.getElementsByClassName(
      "tip-holder"
    )[0] as HTMLDivElement;
    if (!tipHolder) {
      this.tooltipNode = document.createElement("div");
      this.tooltipNode.classList.add("tip-holder");
      document.body.appendChild(this.tooltipNode);
    } else {
      this.tooltipNode = tipHolder;
    }

    // Set up the initial options with both our defaults and all the ones we
    // allow to be passed in
    const options: FullEditorConfiguration = {
      ...this.fullOptions(),
      ...this.defaultOptions,
      mode: this.cleanMode()
    };

    this.cm = CodeMirror.fromTextArea(this.textareaRef.current!, options);

    this.loadMode()
      .then(mode => this.cm.setOption("mode", mode))
      .catch(error => console.error("Unable to load mode", error));

    this.cm.setValue(this.props.value || "");

    // On first load, if focused, set codemirror to focus
    if (editorFocused) {
      this.cm.focus();
    }

    this.cm.on("topBoundary", (editor: Editor) => {
      this.deleteTip();
      focusAbove && focusAbove(editor);
    });
    this.cm.on("bottomBoundary", (editor: Editor) => {
      this.deleteTip();
      focusBelow && focusBelow(editor);
    });

    this.cm.on("cursorActivity", this.handleCursorChange);

    this.cm.on("focus", this.focusChanged.bind(this, true));
    this.cm.on("blur", this.focusChanged.bind(this, false));
    this.cm.on("change", this.codemirrorValueChanged.bind(this));

    this.completionSubject = new Subject<CodeCompletionEvent>();

    // tslint:disable no-shadowed-variable
    const [debounce, immediate] = partition<CodeCompletionEvent>(
      ev => ev.debounce === true
    )(this.completionSubject);

    const mergedCompletionEvents: Observable<CodeCompletionEvent> = merge(
      immediate,
      debounce.pipe(
        debounceTime(150),
        // Upon receipt of an immediate event, cancel anything queued up from
        // debounce. This handles "type chars quickly, then quickly hit
        // Ctrl+Space", ensuring that it generates just one event rather than
        // two.
        takeUntil(immediate),
        repeat() // Resubscribe to wait for next debounced event.
      )
    );

    const completionResults: Observable<() => void> = mergedCompletionEvents.pipe(
      switchMap(ev => {
        const { channels } = this.props;
        if (!channels) {
          throw new Error(
            "Unexpectedly received a completion event when channels were unset"
          );
        }
        return codeComplete(channels, ev.editor).pipe(
          map(completionResult => () => ev.callback(completionResult)),
          // Complete immediately upon next event, even if it's a debounced one
          // https://blog.strongbrew.io/building-a-safe-autocomplete-operator-with-rxjs/
          takeUntil(this.completionSubject),
          catchError((error: Error) => {
            console.log(`Code completion error: ${error.message}`);
            return empty();
          })
        );
      })
    ) as Observable<() => void>;

    this.completionEventsSubscriber = completionResults.subscribe(callback =>
      callback()
    );
  }

  /**
   * Only update the component if certain values change to avoid
   * re-renders triggered by the `Editor` parent component in the
   * @nteract/stateful-components package.
   */
  shouldComponentUpdate(nextProps: CodeMirrorEditorProps, nextState: CodeMirrorEditorState): boolean {
    const valueChanged = this.props.value !== nextProps.value;
    const editorFocusedChanged =
      this.props.editorFocused !== nextProps.editorFocused;

    const codeMirrorConfigChanged = !isEqual(
      this.props.codeMirror,
      nextProps.codeMirror
    );

    // Re-render the page when viewing the tip.
    const bundleChanged = !isEqual(
      this.state.bundle,
      nextState.bundle
    )

    return valueChanged || editorFocusedChanged || codeMirrorConfigChanged || bundleChanged;
  }

  componentDidUpdate(prevProps: CodeMirrorEditorProps): void {
    if (!this.cm) {
      return;
    }

    for (const optionName in this.props.codeMirror) {
      if (!isConfigurable(optionName)) {
        continue;
      }
      if (
        this.props.codeMirror[optionName] !== prevProps.codeMirror[optionName]
      ) {
        if (optionName === "mode") {
          this.loadMode()
            .then(mode => this.cm.setOption("mode", mode))
            .catch(error => console.error("Unable to load mode", error));
        } else {
          this.cm.setOption(optionName, this.props.codeMirror[optionName]);
        }
      }
    }

    const { editorFocused } = this.props;

    if (prevProps.editorFocused !== editorFocused) {
      editorFocused ? this.cm.focus() : this.cm.getInputField().blur();
    }

    if (
      prevProps.codeMirror.cursorBlinkRate !==
      this.props.codeMirror.cursorBlinkRate
    ) {
      if (editorFocused) {
        // code mirror doesn't change the blink rate immediately, we have to
        // move the cursor, or unfocus and refocus the editor to get the blink
        // rate to update - so here we do that (unfocus and refocus)
        this.cm.getInputField().blur();
        this.cm.focus();
      }
    }

    if (
      this.cm &&
      this.props.value !== undefined &&
      normalizeLineEndings(this.cm.getValue()) !==
      normalizeLineEndings(this.props.value)
    ) {
      if (this.props.preserveScrollPosition) {
        const prevScrollPosition = this.cm.getScrollInfo();
        this.cm.setValue(this.props.value);
        this.cm.scrollTo(prevScrollPosition.left, prevScrollPosition.top);
      } else {
        this.cm.setValue(this.props.value);
      }
    }
  }

  componentWillUnmount(): void {
    if (this.cm) {
      this.cm.toTextArea();
    }
    this.completionEventsSubscriber.unsubscribe();
  }

  focusChanged(focused: boolean): void {
    if (this.props.onFocusChange) {
      this.props.onFocusChange(focused);
    }
  }

  hint(editor: Editor & Doc, callback: () => {}): void {
    const { completion, channels } = this.props;
    const debounceThisCompletionRequest: boolean = this
      .debounceNextCompletionRequest;
    this.debounceNextCompletionRequest = true;
    if (completion && channels) {
      const el: CodeCompletionEvent = {
        editor,
        callback,
        debounce: debounceThisCompletionRequest
      };
      this.completionSubject.next(el);
    }
  }

  deleteTip(): void {
    this.setState({ bundle: null });
  }

  handleCursorChange = (editor: Editor) => {
    const cursorCoords = editor.cursorCoords();
    this.setState({ cursorCoords });
  };

  tips(editor: Editor & Doc): void {
    const { tip, channels } = this.props;

    if (this.state.bundle) {
      return this.deleteTip();
    }

    if (tip) {
      tool(channels!, editor).subscribe((resp: { [dict: string]: any }) => {
        const bundle = Object.keys(resp.dict).length > 0 ? resp.dict : null;
        this.setState({ bundle });
      });
    }
  }

  goLineDownOrEmit(editor: Editor & Doc): void {
    const cursor: Position = editor.getCursor();
    const lastLineNumber: number = editor.lastLine();

    if (
      cursor.line === lastLineNumber &&
      !editor.somethingSelected()
    ) {
      CodeMirror.signal(editor, "bottomBoundary");
    } else {
      editor.execCommand("goLineDown");
    }
  }

  goLineUpOrEmit(editor: Editor & Doc): void {
    const cursor: Position = editor.getCursor();
    if (cursor.line === 0 && cursor.ch === 0 && !editor.somethingSelected()) {
      CodeMirror.signal(editor, "topBoundary");
    } else {
      editor.execCommand("goLineUp");
    }
  }

  executeTab(editor: Editor & Doc): void {
    const { line, ch } = editor.getCursor();
    if (editor.somethingSelected()) {
      editor.execCommand("indentMore");
    } else if (line && ch !== 0) {
      editor.execCommand("autocomplete");
    } else {
      editor.execCommand("insertSoftTab");
    }
  }

  codemirrorValueChanged(doc: Editor, change: EditorChangeLinkedList): void {
    if (
      this.props.onChange &&
      // When the change came from us setting the value, don't trigger another change
      change.origin !== "setValue"
    ) {
      this.props.onChange(doc.getValue(), change);
    }
  }

  render(): JSX.Element {
    const { bundle, cursorCoords } = this.state;
    const tooltipNode = this.tooltipNode;
    return (
      <React.Fragment>
        {/* Global CodeMirror CSS packaged up by styled-components */}
        <InitialTextArea
          ref={this.textareaRef}
          defaultValue={this.props.value}
        />
        {tooltipNode
          ? ReactDOM.createPortal(
            <Tooltip
              bundle={bundle}
              cursorCoords={cursorCoords}
              deleteTip={this.deleteTip}
            />,
            tooltipNode
          )
          : null}
      </React.Fragment>
    );
  }
}
