import { Channels } from "@nteract/messaging";
import { CellType, CellId } from "@nteract/commutable";
import * as monaco from "monaco-editor";
import * as React from "react";
import { completionProvider } from "./completions/completionItemProvider";
import { ContentRef } from "@nteract/core";
import { DocumentUri } from "./documentUri";
import debounce from "lodash.debounce";

interface ISize {
  width: number;
  height: number;
}

const editorsToLayout = new Map<monaco.editor.IEditor,ISize>();
let layoutTimer: ReturnType<typeof requestAnimationFrame> | null = null;

/**
 * We need to call layout() on any editors that might have changed size otherwise the view will look off.
 * These updates often happen together with other editors, such as when the window resizes.
 * In order to avoid layout thrashing, we batch these layout calls together and perform them all at once in a RAF timeout.
 */
function scheduleEditorForLayout(editor: monaco.editor.IEditor, size: ISize) {
  editorsToLayout.set(editor, size);
  if (!layoutTimer) {
    // Using RAF here ensures that the layout will happen on the next frame.
    layoutTimer = requestAnimationFrame(() => {
      layoutTimer = null;
      editorsToLayout.forEach((s, ed) => { ed.layout(s);});
      editorsToLayout.clear();
    });
  }
}

/**
 * Unschedule an editor
 */
function unscheduleEditorForLayout(editor: monaco.editor.IEditor) {
  editorsToLayout.delete(editor);
}


export type IModelContentChangedEvent = monaco.editor.IModelContentChangedEvent;

/**
 * This adds an additional padded area around the editor for the mouse
 * to move around before we decide to hide the popup. This makes the
 * transition less erratic and hopefully a smoother experience.
 */
const HOVER_BOUND_DEFAULT_PADDING: number = 5;

/**
 * Settings for configuring keyboard shortcuts with Monaco
 */
export interface IMonacoShortCutProps {
  cellType: CellType;
  cellFocusDirection: string | undefined;
  setCellFocusDirection: (direction?: string) => void;
  focusCell: (payload: { id: CellId; contentRef: ContentRef }) => void;
  focusAboveCellCommandMode: () => void;
  focusBelowCellCommandMode: () => void;
  insertCellBelow: (contentRef: ContentRef, cellType: CellType) => void;
  executeCell: () => void;
  focusEditor: () => void;
  focusNextCellEditor: (setPosition?: boolean) => void;
  focusPreviousCellEditor: () => void;
  unfocusEditor: () => void;
}

/**
 * Common props passed to the editor component
 */
export interface IMonacoComponentProps {
  id: string;
  contentRef: ContentRef;
  theme: string;
  readOnly?: boolean;
  channels?: Channels | undefined;
  value: string;
  editorType?: string;
  editorFocused?: boolean;
  onChange?: (value: string, event?: any) => void;
  onFocusChange?: (focus: boolean) => void;
}

/**
 * Props passed for configuring Monaco Editor
 */
export interface IMonacoConfiguration {
  /**
   * modelUri acts an identifier to query the editor model
   * without being tied to the UI
   * Calling the getModel(modelUri) API
   */
  modelUri?: monaco.Uri;
  enableCompletion?: boolean;
  shouldRegisterDefaultCompletion?: boolean;
  onCursorPositionChange?: (selection: monaco.ISelection | null) => void;
  onRegisterDocumentFormattingEditProvider?: (languageId: string) => void;
  enableFormatting?: boolean;
  onRegisterCompletionProvider?: (languageId: string) => void;
  language: string;
  lineNumbers?: boolean;
  /** set height of editor to fit the specified number of lines in display */
  numberOfLines?: number;
  indentSize?: number;
  tabSize?: number;
  options?: monaco.editor.IEditorOptions;
  shortcutsOptions?: IMonacoShortCutProps;
  shortcutsHandler?: (editor: monaco.editor.IStandaloneCodeEditor, settings?: IMonacoShortCutProps) => void;
  cursorPositionHandler?: (editor: monaco.editor.IStandaloneCodeEditor, settings?: IMonacoProps) => void;
  commandHandler?: (editor: monaco.editor.IStandaloneCodeEditor) => void;
  onDidCreateEditor?: (editor: monaco.editor.IStandaloneCodeEditor) => void;
}

/**
 * Initial props for Monaco Editor received from agnostic component
 */
export type IMonacoProps = IMonacoComponentProps & IMonacoConfiguration;

/**
 * Creates a MonacoEditor instance
 */
export default class MonacoEditor extends React.Component<IMonacoProps> {

  editor?: monaco.editor.IStandaloneCodeEditor;
  editorContainerRef = React.createRef<HTMLDivElement>();
  contentSize: ISize = {width:0, height:0};
  private cursorPositionListener?: monaco.IDisposable;

  private blurEditorWidgetListener?: monaco.IDisposable;
  private mouseMoveListener?: monaco.IDisposable;

  constructor(props: IMonacoProps) {
    super(props);
    this.calculateHeight = this.calculateHeight.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.onDidChangeModelContent = this.onDidChangeModelContent.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.resize = this.resize.bind(this);
    this.hideAllOtherParameterWidgets = this.hideAllOtherParameterWidgets.bind(this);
    this.handleCoordsOutsideWidgetActiveRegion = debounce(
      this.handleCoordsOutsideWidgetActiveRegion.bind(this),
      50 // Make sure we rate limit the calls made by mouse movement
    );
  }

  onDidChangeModelContent(e: monaco.editor.IModelContentChangedEvent) {
    if (this.editor && this.props.onChange) {
        this.props.onChange(this.editor.getValue(), e);
    }
  }

  /**
   * Adjust the height of editor container
   *
   * @param height Expected height of the editor container
   * We check the editor's content height and set the container height to match it
   *
   */
  calculateHeight(height?: number) {
    // Make sure we have an editor
    if (!this.editor) {
      return;
    }

    if (typeof height === "undefined") {
      // Retrieve content height directly from the editor if no height provided as param
      height = this.editor.getContentHeight();
    }

    if (this.editorContainerRef && this.editorContainerRef.current){
      const clientWidth = this.editorContainerRef.current.clientWidth;
      if(this.contentSize.height !== height || this.contentSize.width!==clientWidth) {
        this.updateEditorLayout(clientWidth, height);
      }
    }
  }

  updateEditorLayout(width:number, height:number){
    if(!this.editor){
      return;
    }

    this.contentSize.height=height;
    this.contentSize.width=width;
    scheduleEditorForLayout(this.editor, this.contentSize);
  }

  componentDidMount() {
    if (this.editorContainerRef && this.editorContainerRef.current) {
      // Register Jupyter completion provider if needed
      this.registerCompletionProvider();

      // Register document formatter if needed
      this.registerDocumentFormatter();

      // Use Monaco model uri if provided. Otherwise, create a new model uri using editor id.
      const uri = this.props.modelUri ? this.props.modelUri : monaco.Uri.file(this.props.id);

      // Only create a new model if it does not exist. For example, when we double click on a markdown cell,
      // an editor model is created for it. Once we go back to markdown preview mode that doesn't use the editor,
      // double clicking on the markdown cell will again instantiate a monaco editor. In that case, we should
      // rebind the previously created editor model for the markdown instead of recreating one. Monaco does not
      // allow models to be recreated with the same uri.
      let model = monaco.editor.getModel(uri);
      if (!model) {
        model = monaco.editor.createModel(this.props.value, this.props.language, uri);
      }

      // Update Text model options
      model.updateOptions({
        indentSize: this.props.indentSize,
        tabSize: this.props.tabSize
      });

      // Create Monaco editor backed by a Monaco model.
      this.editor = monaco.editor.create(this.editorContainerRef.current, {
        autoIndent: "advanced",
        // Allow editor pop up widgets such as context menus, signature help, hover tips to be able to be
        // displayed outside of the editor. Without this, the pop up widgets can be clipped.
        fixedOverflowWidgets: true,
        find: {
          addExtraSpaceOnTop: false, // pops the editor out of alignment if turned on
          seedSearchStringFromSelection: true, // default is true
          autoFindInSelection: "never" // default is "never"
        },
        language: this.props.language,
        lineNumbers: this.props.lineNumbers ? "on" : "off",
        minimap: {
          enabled: false
        },
        model,
        overviewRulerLanes: 0,
        padding: {
          top: 12,
          bottom: 5
        },
        readOnly: this.props.readOnly,
        // Disable highlight current line, too much visual noise with it on.
        // VS Code also has it disabled for their notebook experience.
        renderLineHighlight: "none",
        scrollbar: {
          useShadows: false,
          verticalHasArrows: false,
          horizontalHasArrows: false,
          vertical: "hidden",
          horizontal: "hidden",
          verticalScrollbarSize: 0,
          horizontalScrollbarSize: 0,
          arrowSize: 30
        },
        theme: this.props.theme,
        value: this.props.value,
        // Apply custom settings from configuration
        ...this.props.options,
        // this is required, otherwise the editor will continue to change its size on layout if set to true in options overrides
        scrollBeyondLastLine: false
      });

      // Handle on create events
      if (this.props.onDidCreateEditor) {
        this.props.onDidCreateEditor(this.editor);
      }

      // Handle custom keyboard shortcuts
      if (this.editor && this.props.shortcutsHandler && this.props.shortcutsOptions) {
        this.props.shortcutsHandler(this.editor, this.props.shortcutsOptions);
      }

      // Handle custom commands
      if (this.editor && this.props.commandHandler) {
        this.props.commandHandler(this.editor);
      }

      this.toggleEditorOptions(!!this.props.editorFocused);

      if (this.props.editorFocused) {
        if (!this.editor.hasTextFocus()) {
          // Bring browser focus to the editor if text not already in focus
          this.editor.focus();
        }
        this.registerCursorListener();
      }

      // Adds listener under the resize window event which calls the resize method
      window.addEventListener("resize", this.resize);

      // Adds listeners for undo and redo actions emitted from the toolbar
      this.editorContainerRef.current.addEventListener("undo", () => {
        if (this.editor) {
          this.editor.trigger("undo-event", "undo", {});
        }
      });
      this.editorContainerRef.current.addEventListener("redo", () => {
        if (this.editor) {
          this.editor.trigger("redo-event", "redo", {});
        }
      });
      // Resize Editor container on content size change
      this.editor.onDidContentSizeChange((info) => {
        if (info.contentHeightChanged) {
          this.calculateHeight(info.contentHeight);
        }
      });
      this.editor.onDidChangeModelContent(this.onDidChangeModelContent);
      this.editor.onDidFocusEditorText(this.onFocus);
      this.editor.onDidBlurEditorText(this.onBlur);
      this.calculateHeight();

      // Ensures that the source contents of the editor (value) is consistent with the state of the editor
      this.editor.setValue(this.props.value);
      if(this.props.cursorPositionHandler){
        this.props.cursorPositionHandler(this.editor, this.props);
      }

      // When editor loses focus, hide parameter widgets (if any currently displayed).
      this.blurEditorWidgetListener = this.editor.onDidBlurEditorWidget(() => {
        this.hideParameterWidget();
      });

      if (this.editor) {
        this.mouseMoveListener = this.editor.onMouseMove((e: any) => {
          this.handleCoordsOutsideWidgetActiveRegion(e.event?.pos?.x, e.event?.pos?.y);
        });
      }
    }
  }

  /**
   * Tells editor to check the surrounding container size and resize itself appropriately
   */
  resize() {
    // We call layout only if the container is not hidden (e.g. if the notebook tab is not active)
    // offsetHeight is used here to determine visibility (see https://davidwalsh.name/offsetheight-visibility)
    if (this.editor && this.editorContainerRef.current?.offsetHeight) {
      const { clientWidth, clientHeight } = this.editorContainerRef.current;
      this.updateEditorLayout(clientWidth, clientHeight);
    }
  }

  componentDidUpdate(prevProps: IMonacoProps) {
    if (!this.editor) {
      return;
    }

    const { value, language, contentRef, id, editorFocused, theme } = this.props;

    if(this.props.cursorPositionHandler){
      this.props.cursorPositionHandler(this.editor, this.props);
    }

    // Handle custom commands
    if (this.editor && this.props.commandHandler) {
      this.props.commandHandler(this.editor);
    }

    // Ensures that the source contents of the editor (value) is consistent with the state of the editor
    // and the value has actually changed.
    if (prevProps.value !== this.props.value && this.editor.getValue() !== this.props.value) {
      this.editor.setValue(this.props.value);
    } 

    completionProvider.setChannels(this.props.channels);

    // Register Jupyter completion provider if needed
    this.registerCompletionProvider();

    // Apply new model to the editor when the language is changed.
    const model = this.editor.getModel();
    if (model && language && model.getModeId() !== language) {

        // Get a reference to the current editor
        const editor = this.editor;

        // We need to set the model in a separate event because the `language` prop update happens before the
        // internal editor receives an update to the cursor position when invoking language magics. Additionally,
        // we need to dispose of the old model in a separate event. We cannot dispose of the model within the
        // componentDidUpdate method or else the editor will throw an exception. Zero in the timeout field
        // means execute immediately but in a seperate next event.
        setTimeout(() => {
          const newUri = DocumentUri.createCellUri(contentRef, id, language);
          if (!monaco.editor.getModel(newUri)) {
            // Save the cursor position before we set new model.
            const position = editor.getPosition();

            // Set new model targeting the changed language.
            editor.setModel(monaco.editor.createModel(value, language, newUri));

            // Restore cursor position to new model.
            if (position) {
              editor.setPosition(position);
            }

            // Set focus
            if (editorFocused && !editor.hasTextFocus()) {
              editor.focus();
            }

            // Dispose the old model
            model.dispose()
          }
        }, 0);
    }
    
    const monacoUpdateOptions: monaco.editor.IEditorOptions & monaco.editor.IGlobalEditorOptions = { readOnly: this.props.readOnly };
    if (theme) {
      monacoUpdateOptions.theme = theme;
    }

    this.editor.updateOptions(monacoUpdateOptions);

    // In the multi-tabs scenario, when the notebook is hidden by setting "display:none",
    // Any state update propagated here would cause a UI re-layout, monaco-editor will then recalculate
    // and set its height to 5px.
    // To work around that issue, we skip updating the UI when paraent element's offsetParent is null (which
    // indicate an ancient element is hidden by display set to none)
    // We may revisit this when we get to refactor for multi-notebooks.
    if (!this.editorContainerRef.current?.offsetParent) {
      return;
    }

    // Set focus
    if (editorFocused && !this.editor.hasTextFocus()) {
      this.editor.focus();
    }

    // Tells the editor pane to check if its container has changed size and fill appropriately
    this.calculateHeight();
  }

  componentWillUnmount() {
    if (this.editor) {
      try {
        const model = this.editor.getModel();
        // Remove the resize listener
        window.removeEventListener("resize", this.resize);
        if (model) {
          model.dispose();
        }

        unscheduleEditorForLayout(this.editor);
        this.editor.dispose();
      } catch (err) {
        // tslint:disable-next-line
        console.error(`Error occurs in disposing editor: ${JSON.stringify(err)}`);
      }
    }
    if (this.blurEditorWidgetListener) {
      this.blurEditorWidgetListener.dispose();
    }
    if (this.mouseMoveListener) {
      this.mouseMoveListener.dispose();
    }
  }

  render() {
    return (
      <div className="monaco-container">
        <div ref={this.editorContainerRef} id={`editor-${this.props.id}`} />
      </div>
    );
  }

  /**
   * Register default kernel-based completion provider.
   * @param language Language
   */
  registerDefaultCompletionProvider(language: string) {
    // onLanguage event is emitted only once per language when language is first time needed.
    monaco.languages.onLanguage(language, () => {
      monaco.languages.registerCompletionItemProvider(language, completionProvider);
    });
  }

  private onFocus() {
    if(this.props.onFocusChange){
      this.props.onFocusChange(true);
    }
    this.toggleEditorOptions(true);
    this.registerCursorListener();
  }

  private onBlur() {
    if(this.props.onFocusChange){
      this.props.onFocusChange(false);
    }
    this.toggleEditorOptions(false);
    this.unregisterCursorListener();
  }

  private registerCursorListener() {
    if (this.editor && this.props.onCursorPositionChange) {
      const selection = this.editor.getSelection();
      this.props.onCursorPositionChange(selection);

      if (!this.cursorPositionListener) {
        this.cursorPositionListener = this.editor.onDidChangeCursorSelection((event) =>
          this.props.onCursorPositionChange!(event.selection)
        );
      }
    }
  }

  private unregisterCursorListener() {
    if (this.cursorPositionListener) {
      this.cursorPositionListener.dispose();
      this.cursorPositionListener = undefined;
    }
  }

  /**
   * Toggle editor options based on if the editor is in active state (i.e. focused).
   * When the editor is not active, we want to deactivate some of the visual noise.
   * @param isActive Whether editor is active.
   */
  private toggleEditorOptions(isActive: boolean) {
    if (this.editor) {
      this.editor.updateOptions({
        matchBrackets: isActive ? "always" : "never",
        occurrencesHighlight: isActive,
        renderIndentGuides: isActive
      });
    }
  }

  /**
   * Register language features for target language. Call before setting language type to model.
   */
  private registerCompletionProvider() {
    const { enableCompletion, language, onRegisterCompletionProvider, shouldRegisterDefaultCompletion } = this.props;

    if (enableCompletion && language) {
      if (onRegisterCompletionProvider) {
        onRegisterCompletionProvider(language);
      } else if (shouldRegisterDefaultCompletion) {
        this.registerDefaultCompletionProvider(language);
      }
    }
  }

  private registerDocumentFormatter() {
    const { enableFormatting, language, onRegisterDocumentFormattingEditProvider } = this.props;

    if (enableFormatting && language) {
      if (onRegisterDocumentFormattingEditProvider) {
        onRegisterDocumentFormattingEditProvider(language);
      }
    }
  }

  /**
   * This will hide the parameter widget if the user is not hovering over
   * the parameter widget for this monaco editor.
   *
   * Notes: See issue https://github.com/microsoft/vscode-python/issues/7851 for further info.
   * Hide the parameter widget if the following conditions have been met:
   * - Editor doesn't have focus
   * - Mouse is not over (hovering) the parameter widget
   *
   * This method is only used for blurring at the moment given that parameter widgets from
   * other cells are hidden by mouse move events.
   * 
   * @private
   * @returns
   * @memberof MonacoEditor
   */
  private hideParameterWidget() {
    if (
      !this.editor ||
      !this.editor.getDomNode() ||
      !this.editorContainerRef.current
    ) {
      return;
    }

    // Find all elements that the user is hovering over.
    // It's possible the parameter widget is one of them.
    const hoverElements: Element[] = Array.prototype.slice.call(document.querySelectorAll(':hover'));

    // These are the classes that will appear on a parameter widget when they are visible.
    const parameterWidgetClasses = ['editor-widget', 'parameter-hints-widget', 'visible'];

    // Find the parameter widget the user is currently hovering over.
    let isParameterWidgetHovered = hoverElements.find(item => {
      if (typeof item.className !== 'string') {
        return false;
      }

      // Check if user is hovering over a parameter widget.
      const classes = item.className.split(' ');

      if (!parameterWidgetClasses.every(cls => classes.indexOf(cls) >= 0)) {
        // Not all classes required in a parameter hint widget are in this element.
        // Hence this is not a parameter widget.
        return false;
      }

      // Ok, this element that the user is hovering over is a parameter widget.
      // Next, check whether this parameter widget belongs to this monaco editor.
      // We have a list of parameter widgets that belong to this editor, hence a simple lookup.
      return this.editorContainerRef.current?.contains(item);
    });

    // If the parameter widget is being hovered, don't hide it.
    if (isParameterWidgetHovered) {
      return;
    }

    // If the editor has focus, don't hide the parameter widget.
    // This is the default behavior. Let the user hit `Escape` or click somewhere
    // to forcefully hide the parameter widget.
    if (this.editor.hasWidgetFocus()) {
      return;
    }

    // If we got here, then the user is not hovering over the parameter widgets.
    // & the editor doesn't have focus.
    // However some of the parameter widgets associated with this monaco editor are visible.
    // We need to hide them.
    // Solution: Hide the widgets manually.
    this.hideWidgets(this.editorContainerRef.current, ['.parameter-hints-widget']);
  }

  /**
   * Hides widgets such as parameters and hover, that belong to a given parent HTML element.
   *
   * @private
   * @param {HTMLDivElement} widgetParent
   * @param {string[]} selectors
   * @memberof MonacoEditor
   */
  private hideWidgets(widgetParent: HTMLDivElement, selectors: string[]) {
    for (const selector of selectors) {
      for (const widget of Array.from<HTMLDivElement>(widgetParent.querySelectorAll(selector))) {
        widget.setAttribute(
          'class',
          widget.className
            .split(' ')
            .filter((cls: string) => cls !== 'visible')
            .join(' ')
        );
        if (widget.style.visibility !== 'hidden') {
          widget.style.visibility = 'hidden';
        }
      }
    }
  }

  /**
   * Hides the parameters widgets related to other monaco editors.
   * Use this to ensure we only display parameters widgets for current editor (by hiding others).
   *
   * @private
   * @returns
   * @memberof MonacoEditor
   */
  private hideAllOtherParameterWidgets() {
    if (!this.editorContainerRef.current) {
      return;
    }
    const widgetParents: HTMLDivElement[] = Array.prototype.slice.call(
      document.querySelectorAll('div.monaco-container'));

    widgetParents
      .filter(widgetParent => widgetParent !== this.editorContainerRef.current?.parentElement)
      .forEach(widgetParent => this.hideWidgets(widgetParent, ['.parameter-hints-widget']));
  }

  /**
   * Return true if (x,y) coordinates overlap with an element's bounding rect. 
   * @param {HTMLDivElement} element 
   * @param {number} x
   * @param {number} y
   * @param {number} padding
   */
  private coordsInsideElement(
    element: Element | null | undefined,
    x: number,
    y: number,
    padding: number = HOVER_BOUND_DEFAULT_PADDING
  ): boolean {
    if (!element) return false;
    const clientRect = element.getBoundingClientRect();
    return (
      x >= clientRect.left - padding &&
      x <= clientRect.right + padding &&
      y >= clientRect.top - padding &&
      y <= clientRect.bottom + padding
    );
  }

  /**
   * Hide all other widgets belonging to other cells only if the currently active
   * parameter widget (at most one) is being hovered by the user.
   * @param {number} x 
   * @param {number} y 
   */
  private handleCoordsOutsideWidgetActiveRegion(x: number, y: number) {
    let widget = document.querySelector('.parameter-hints-widget');
    if (widget != null && !this.coordsInsideElement(widget, x, y)) {
      this.hideAllOtherParameterWidgets();
    }
  }
}
