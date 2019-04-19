import { Channels } from "@nteract/messaging";

import CodeMirror, {
  Doc,
  Editor,
  EditorChangeLinkedList,
  EditorFromTextArea,
  Position,
  Token
} from "codemirror";

import {
  configurableCodeMirrorOptions,
  FullEditorConfiguration,
  isConfigurable
} from "./configurable";

import { debounce } from "lodash";
import * as React from "react";
import {
  empty,
  fromEvent,
  merge,
  Observable,
  of,
  Subject,
  Subscription
} from "rxjs";
import {
  catchError,
  debounceTime,
  map,
  partition,
  repeat,
  switchMap,
  takeUntil
} from "rxjs/operators";

import { excludedIntelliSenseTriggerKeys } from "./excludedIntelliSenseKeys";
import { codeComplete, pick } from "./jupyter/complete";
import { tool } from "./jupyter/tooltip";

import { InitialTextArea } from "./components/initial-text-area";
import { ToolTip } from "./components/tooltip";

import CodeMirrorCSS from "./vendored/codemirror";
import ShowHintCSS from "./vendored/show-hint";

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
  preserveScrollPosition: boolean;
  editorFocused: boolean;
  completion: boolean;
  tip?: boolean;
  focusAbove?: (instance: Editor) => void;
  focusBelow?: (instance: Editor) => void;
  // _Our_ theme, not the codemirror one we use
  theme: string;
  channels?: Channels | null;
  // TODO: We only check if this is idle, so the completion provider should only
  //       care about this when kernelStatus === idle _and_ we're the active cell
  //       could instead call it `canTriggerCompletion` and reduce our current re-renders
  kernelStatus: string;
  onChange?: (value: string, change: EditorChangeLinkedList) => void;
  onFocusChange?: (focused: boolean) => void;
  value: string;
} & Partial<FullEditorConfiguration>;

interface CodeMirrorEditorState {
  isFocused: boolean;

  toolTipBundle: any;
}

interface CodeCompletionEvent {
  editor: Editor & Doc;
  callback: (completionResult: any) => {};
  debounce: boolean;
}

export default class CodeMirrorEditor extends React.PureComponent<
  CodeMirrorEditorProps,
  CodeMirrorEditorState
> {
  static defaultProps: Partial<CodeMirrorEditorProps> = {
    value: "",
    channels: null,
    completion: false,
    editorFocused: false,
    kernelStatus: "not connected",
    theme: "light",
    tip: false,
    autofocus: false,

    // CodeMirror specific options for defaults
    matchBrackets: true,
    indentUnit: 4,
    lineNumbers: false,
    cursorBlinkRate: 530
  };

  textarea?: HTMLTextAreaElement | null;
  cm!: EditorFromTextArea;
  defaultOptions: FullEditorConfiguration;
  keyupEventsSubscriber!: Subscription;
  completionSubject!: Subject<CodeCompletionEvent>;
  completionEventsSubscriber!: Subscription;
  debounceNextCompletionRequest: boolean;
  toolTipRef = React.createRef<HTMLDivElement>();

  textareaRef: React.RefObject<HTMLTextAreaElement> = React.createRef<
    HTMLTextAreaElement
  >();

  constructor(props: CodeMirrorEditorProps) {
    super(props);
    this.hint = this.hint.bind(this);
    (this.hint as any).async = true;
    this.tips = this.tips.bind(this);
    this.debounceNextCompletionRequest = true;
    this.state = { isFocused: true, toolTipBundle: null };

    this.fullOptions = this.fullOptions.bind(this);
    this.cleanMode = this.cleanMode.bind(this);

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
      Up: this.goLineUpOrEmit
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
    return Object.keys(this.props)
      .filter(isConfigurable)
      .reduce((obj, key) => {
        obj[key] = this.props[key];
        return obj;
      }, defaults);
  }

  cleanMode(): string | object {
    if (!this.props.mode) {
      return "text/plain";
    }
    if (typeof this.props.mode === "string") {
      return this.props.mode;
    }
    // If the mode comes in as an immutable map, convert it first
    if (typeof this.props.mode === "object" && "toJS" in this.props.mode) {
      return this.props.mode.toJS();
    }
    return this.props.mode;
  }

  componentWillMount(): void {
    this.componentWillReceiveProps = debounce(
      this.componentWillReceiveProps,
      0
    );
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
    require("codemirror/mode/css/css");
    require("codemirror/mode/julia/julia");
    require("codemirror/mode/r/r");
    require("codemirror/mode/clike/clike");
    require("codemirror/mode/shell/shell");
    require("codemirror/mode/sql/sql");
    require("codemirror/mode/markdown/markdown");
    require("codemirror/mode/gfm/gfm");

    require("./mode/ipython");

    const { completion, editorFocused, focusAbove, focusBelow } = this.props;

    // Set up the initial options with both our defaults and all the ones we
    // allow to be passed in
    const options: FullEditorConfiguration = {
      ...this.fullOptions,
      ...this.defaultOptions,
      mode: this.cleanMode()
    };

    this.cm = CodeMirror.fromTextArea(this.textareaRef.current!, options);

    this.cm.setValue(this.props.value || "");

    // On first load, if focused, set codemirror to focus
    if (editorFocused) {
      this.cm.focus();
    }

    this.cm.on("topBoundary", focusAbove!);
    this.cm.on("bottomBoundary", focusBelow!);

    this.cm.on("focus", this.focusChanged.bind(this, true));
    this.cm.on("blur", this.focusChanged.bind(this, false));
    this.cm.on("change", this.codemirrorValueChanged.bind(this));

    const keyupEvents: Observable<EditorKeyEvent> = fromEvent<EditorKeyEvent>(
      this.cm as any,
      "keyup",
      (editor, ev) => ({ editor, ev })
    );

    // Initiate code completion in response to some keystrokes *other than*
    //  "Ctrl-Space" (which is bound in extraKeys, above)
    this.keyupEventsSubscriber = keyupEvents
      .pipe(switchMap<EditorKeyEvent, EditorKeyEvent>(i => of(i)))
      .subscribe(({ editor, ev }) => {
        if (
          completion &&
          !editor.state.completionActive &&
          !excludedIntelliSenseTriggerKeys[(ev.keyCode || ev.which).toString()]
        ) {
          const cursor: Position = editor.getDoc().getCursor();
          const token: Token = editor.getTokenAt(cursor);
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

    const completionResults: Observable<
      () => void
    > = mergedCompletionEvents.pipe(
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
    );

    this.completionEventsSubscriber = completionResults.subscribe(callback =>
      callback()
    );
  }

  componentDidUpdate(prevProps: CodeMirrorEditorProps): void {
    if (!this.cm) {
      return;
    }

    const { editorFocused, theme } = this.props;

    if (prevProps.theme !== theme) {
      this.cm.refresh();
    }

    if (prevProps.editorFocused !== editorFocused) {
      editorFocused ? this.cm.focus() : this.cm.getInputField().blur();
    }

    if (prevProps.cursorBlinkRate !== this.props.cursorBlinkRate) {
      this.cm.setOption("cursorBlinkRate", this.props.cursorBlinkRate);
      if (editorFocused) {
        // code mirror doesn't change the blink rate immediately, we have to
        // move the cursor, or unfocus and refocus the editor to get the blink
        // rate to update - so here we do that (unfocus and refocus)
        this.cm.getInputField().blur();
        this.cm.focus();
      }
    }

    if (prevProps.mode !== this.props.mode) {
      this.cm.setOption("mode", this.cleanMode());
    }
  }

  componentWillReceiveProps(nextProps: CodeMirrorEditorProps): void {
    if (
      this.cm &&
      nextProps.value !== undefined &&
      normalizeLineEndings(this.cm.getValue()) !==
        normalizeLineEndings(nextProps.value)
    ) {
      if (this.props.preserveScrollPosition) {
        const prevScrollPosition = this.cm.getScrollInfo();
        this.cm.setValue(nextProps.value);
        this.cm.scrollTo(prevScrollPosition.left, prevScrollPosition.top);
      } else {
        this.cm.setValue(nextProps.value);
      }
    }

    for (const optionName in nextProps) {
      if (!isConfigurable(optionName)) {
        continue;
      }
      if (nextProps[optionName] !== this.props[optionName]) {
        this.cm.setOption(optionName, nextProps[optionName]);
      }
    }
  }

  componentWillUnmount(): void {
    if (this.cm) {
      this.cm.toTextArea();
    }
    this.keyupEventsSubscriber.unsubscribe();
    this.completionEventsSubscriber.unsubscribe();
  }

  focusChanged(focused: boolean): void {
    this.setState({
      isFocused: focused
    });
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

  deleteTip = () => {
    this.setState({ toolTipBundle: null });
  };

  tips(editor: Editor & Doc): void {
    const { tip, channels } = this.props;

    if (tip) {
      tool(channels!, editor).subscribe((resp: { [dict: string]: any }) => {
        const bundle = resp.dict;

        if (Object.keys(bundle).length === 0) {
          return;
        }
        this.setState({ toolTipBundle: bundle });
      });
    }
  }

  goLineDownOrEmit(editor: Editor & Doc): void {
    const cursor: Position = editor.getCursor();
    const lastLineNumber: number = editor.lastLine();
    const lastLine: string = editor.getLine(lastLineNumber);
    if (
      cursor.line === lastLineNumber &&
      cursor.ch === lastLine.length &&
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
    editor.somethingSelected()
      ? editor.execCommand("indentMore")
      : editor.execCommand("insertSoftTab");
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
    const { toolTipBundle } = this.state;
    return (
      <React.Fragment>
        {/* Global CodeMirror CSS packaged up by styled-components */}

        <div className="tip-holder" ref={this.toolTipRef} />
        <InitialTextArea
          ref={this.textareaRef}
          defaultValue={this.props.value}
        />
        {/* CodeMirror will inject a div right below the TextArea above */}
        {toolTipBundle ? (
          <ToolTip
            editor={this.cm}
            bundle={toolTipBundle}
            toolTipRef={this.toolTipRef}
            deleteTip={this.deleteTip}
          />
        ) : null}
      </React.Fragment>
    );
  }
}
