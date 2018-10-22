/* eslint-disable no-return-assign */
/* @flow */
import * as Immutable from "immutable";
import * as React from "react";
import { actions, selectors } from "@nteract/core";
import type { AppState, ContentRef, KernelRef } from "@nteract/core";
import {
  Input,
  Prompt,
  Source,
  Pagers,
  Outputs,
  Cell,
  themes
} from "@nteract/presentational-components";
import { DragDropContext as dragDropContext } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";
import { connect } from "react-redux";
import { RichestMime, Output } from "@nteract/display-area";
import {
  displayOrder as defaultDisplayOrder,
  transforms as defaultTransforms
} from "@nteract/transforms";

import DraggableCell from "./draggable-cell";
import CellCreator from "./cell-creator";
import StatusBar from "./status-bar";
import MarkdownPreviewer from "./markdown-preview";
import Editor from "./editor";
import Toolbar from "./toolbar";
import { HijackScroll } from "./hijack-scroll";

type AnyCellProps = {
  id: string,
  tags: Immutable.Set<string>,
  contentRef: ContentRef,
  channels: rxjs$Subject<any>,
  cellType: "markdown" | "code" | "raw",
  theme: string,
  source: string,
  executionCount: *,
  outputs: Immutable.List<*>,
  pager: Immutable.List<*>,
  cellStatus: string,
  cellFocused: boolean, // not the ID of which is focused
  editorFocused: boolean,
  sourceHidden: boolean,
  outputHidden: boolean,
  outputExpanded: boolean,
  displayOrder: typeof defaultDisplayOrder,
  transforms: typeof defaultTransforms,
  models: Immutable.Map<string, *>,
  codeMirrorMode: *,
  selectCell: () => void,
  focusEditor: () => void,
  unfocusEditor: () => void,
  focusAboveCell: () => void,
  focusBelowCell: () => void
};

const markdownEditorOptions = {
  // Markdown should always be line wrapped
  lineWrapping: true,
  // Rely _directly_ on the codemirror mode
  mode: {
    name: "gfm",
    tokenTypeOverrides: {
      emoji: "emoji"
    }
  }
};

const rawEditorOptions = {
  // Markdown should always be line wrapped
  lineWrapping: true,
  // Rely _directly_ on the codemirror mode
  mode: {
    name: "text/plain",
    tokenTypeOverrides: {
      emoji: "emoji"
    }
  }
};

const mapStateToCellProps = (state, { id, contentRef }) => {
  const model = selectors.model(state, { contentRef });
  if (!model || model.type !== "notebook") {
    throw new Error(
      "Cell components should not be used with non-notebook models"
    );
  }

  const cell = selectors.notebook.cellById(model, { id });
  if (!cell) {
    throw new Error("cell not found inside cell map");
  }

  const cellType = cell.get("cell_type");
  const outputs = cell.get("outputs", Immutable.List());

  const sourceHidden =
    cellType === "code" &&
    (cell.getIn(["metadata", "inputHidden"], false) ||
      cell.getIn(["metadata", "hide_input"], false));

  const outputHidden =
    cellType === "code" &&
    (outputs.size === 0 || cell.getIn(["metadata", "outputHidden"]));

  const outputExpanded =
    cellType === "code" && cell.getIn(["metadata", "outputExpanded"]);

  const tags = cell.getIn(["metadata", "tags"], Immutable.Set());

  const pager = model.getIn(["cellPagers", id], Immutable.List());

  const kernelRef = selectors.currentKernelRef(state);
  let channels: rxjs$Subject<any>;
  if (kernelRef) {
    const kernel = selectors.kernel(state, { kernelRef });
    if (kernel) {
      channels = kernel.channels;
    }
  }

  return {
    contentRef,
    channels,
    cellType,
    tags,
    source: cell.get("source", ""),
    theme: selectors.userTheme(state),
    executionCount: cell.get("execution_count"),
    outputs,
    models: selectors.models(state),
    pager,
    cellFocused: model.cellFocused === id,
    editorFocused: model.editorFocused === id,
    sourceHidden,
    outputHidden,
    outputExpanded,
    cellStatus: model.transient.getIn(["cellMap", id, "status"])
  };
};

const mapDispatchToCellProps = (dispatch, { id, contentRef }) => ({
  selectCell: () => dispatch(actions.focusCell({ id, contentRef })),
  focusEditor: () => dispatch(actions.focusCellEditor({ id, contentRef })),
  unfocusEditor: () =>
    dispatch(actions.focusCellEditor({ id: null, contentRef })),
  focusAboveCell: () => {
    dispatch(actions.focusPreviousCell({ id, contentRef }));
    dispatch(actions.focusPreviousCellEditor({ id, contentRef }));
  },
  focusBelowCell: () => {
    dispatch(
      actions.focusNextCell({ id, createCellIfUndefined: true, contentRef })
    );
    dispatch(actions.focusNextCellEditor({ id, contentRef }));
  }
});

const CellBanner = (props: { children: * }) => {
  return (
    <React.Fragment>
      <div>{props.children}</div>
      <style jsx>{`
        div {
          background-color: darkblue;
          color: ghostwhite;
          padding: 9px 16px;

          font-size: 12px;
          line-height: 20px;
        }
      `}</style>
    </React.Fragment>
  );
};

class AnyCell extends React.PureComponent<AnyCellProps, *> {
  render(): ?React$Element<any> {
    const {
      cellFocused,
      cellStatus,
      cellType,
      editorFocused,
      focusAboveCell,
      focusBelowCell,
      focusEditor,
      id,
      tags,
      selectCell,
      unfocusEditor,
      contentRef,
      sourceHidden
    } = this.props;
    const running = cellStatus === "busy";
    const queued = cellStatus === "queued";
    let element = null;

    switch (cellType) {
      case "code":
        element = (
          <React.Fragment>
            <Input hidden={this.props.sourceHidden}>
              <Prompt
                counter={this.props.executionCount}
                running={running}
                queued={queued}
              />
              <Source>
                <Editor
                  tip
                  completion
                  id={id}
                  contentRef={contentRef}
                  value={this.props.source}
                  cellFocused={cellFocused}
                  editorFocused={editorFocused}
                  theme={this.props.theme}
                  focusAbove={focusAboveCell}
                  focusBelow={focusBelowCell}
                  options={{
                    mode: Immutable.isImmutable(this.props.codeMirrorMode)
                      ? this.props.codeMirrorMode.toJS()
                      : this.props.codeMirrorMode
                  }}
                />
              </Source>
            </Input>
            <Pagers>
              {this.props.pager.map((pager, key) => (
                <RichestMime
                  expanded
                  className="pager"
                  displayOrder={this.props.displayOrder}
                  transforms={this.props.transforms}
                  bundle={pager}
                  theme={this.props.theme}
                  key={key}
                />
              ))}
            </Pagers>
            <Outputs
              hidden={this.props.outputHidden}
              expanded={this.props.outputExpanded}
            >
              {this.props.outputs.map((output, index) => (
                <Output
                  key={index}
                  output={output}
                  displayOrder={this.props.displayOrder}
                  transforms={this.props.transforms}
                  theme={this.props.theme}
                  models={this.props.models}
                  channels={this.props.channels}
                />
              ))}
            </Outputs>
          </React.Fragment>
        );

        break;
      case "markdown":
        element = (
          <MarkdownPreviewer
            focusAbove={focusAboveCell}
            focusBelow={focusBelowCell}
            focusEditor={focusEditor}
            cellFocused={cellFocused}
            editorFocused={editorFocused}
            unfocusEditor={unfocusEditor}
            source={this.props.source}
          >
            <Source>
              <Editor
                id={id}
                value={this.props.source}
                theme={this.props.theme}
                focusAbove={focusAboveCell}
                focusBelow={focusBelowCell}
                cellFocused={cellFocused}
                editorFocused={editorFocused}
                contentRef={contentRef}
                options={markdownEditorOptions}
              />
            </Source>
          </MarkdownPreviewer>
        );
        break;

      case "raw":
        element = (
          <Source>
            <Editor
              id={id}
              value={this.props.source}
              theme={this.props.theme}
              focusAbove={focusAboveCell}
              focusBelow={focusBelowCell}
              cellFocused={cellFocused}
              editorFocused={editorFocused}
              contentRef={contentRef}
              options={rawEditorOptions}
            />
          </Source>
        );
        break;
      default:
        element = <pre>{this.props.source}</pre>;
        break;
    }

    return (
      <HijackScroll focused={cellFocused} onClick={selectCell}>
        <Cell isSelected={cellFocused}>
          {/* The following banners come from when papermill's acknowledged
              cell.metadata.tags are set
          */}
          {tags.has("parameters") ? (
            <CellBanner>Papermill - Parametrized</CellBanner>
          ) : null}
          {tags.has("default parameters") ? (
            <CellBanner>Papermill - Default Parameters</CellBanner>
          ) : null}
          <Toolbar
            type={cellType}
            sourceHidden={sourceHidden}
            id={id}
            source={this.props.source}
            contentRef={contentRef}
          />
          {element}
          <style jsx>{`
            /*
             * Show the cell-toolbar-mask if hovering on cell,
             * cell was the last clicked (has .focused class).
            */
            :global(.cell:hover .cell-toolbar-mask),
            :global(.cell.focused .cell-toolbar-mask) {
              display: block;
            }
          `}</style>
        </Cell>
      </HijackScroll>
    );
  }
}

// $FlowFixMe: react-redux typings
export const ConnectedCell = connect(
  mapStateToCellProps,
  mapDispatchToCellProps
)(AnyCell);

type NotebookProps = NotebookStateProps & NotebookDispatchProps;

type PureNotebookProps = {
  displayOrder?: Array<string>,
  cellOrder?: Immutable.List<any>,
  transforms?: Object,
  theme?: string,
  codeMirrorMode?: string | Immutable.Map<string, *>,
  contentRef: ContentRef,
  kernelRef?: KernelRef
};

type NotebookStateProps = {
  displayOrder: Array<string>,
  cellOrder: Immutable.List<any>,
  transforms: Object,
  theme: string,
  codeMirrorMode: string | Immutable.Map<string, *>,
  contentRef: ContentRef,
  kernelRef: ?KernelRef
};

type NotebookDispatchProps = {
  moveCell: (payload: *) => *,
  focusCell: (payload: *) => *,
  executeFocusedCell: (payload: *) => *,
  focusNextCell: (*) => *,
  focusNextCellEditor: (*) => *
};

const mapStateToProps = (
  state: AppState,
  ownProps: PureNotebookProps
): NotebookStateProps => {
  const contentRef = ownProps.contentRef;

  if (!contentRef) {
    throw new Error("<Notebook /> has to have a contentRef");
  }
  const content = selectors.content(state, { contentRef });
  const model = selectors.model(state, { contentRef });

  if (!model || !content) {
    throw new Error(
      "<Notebook /> has to have content & model that are notebook types"
    );
  }
  if (model.type === "dummy" || model.type === "unknown") {
    return {
      theme: selectors.userTheme(state),
      cellOrder: Immutable.List(),
      transforms: ownProps.transforms || defaultTransforms,
      displayOrder: ownProps.displayOrder || defaultDisplayOrder,
      codeMirrorMode: Immutable.Map({ name: "text/plain" }),
      kernelRef: null,
      contentRef
    };
  }

  if (model.type !== "notebook") {
    throw new Error(
      "<Notebook /> has to have content & model that are notebook types"
    );
  }

  // TODO: Determine and fix things so we have one reliable place for the kernelRef
  const kernelRef =
    selectors.currentKernelRef(state) || ownProps.kernelRef || model.kernelRef;

  let kernelInfo = null;

  if (kernelRef) {
    const kernel = selectors.kernel(state, { kernelRef });
    if (kernel) {
      kernelInfo = kernel.info;
    }
  }

  // TODO: Rely on the kernel's codeMirror version first and foremost, then fallback on notebook
  const codeMirrorMode = kernelInfo
    ? kernelInfo.codemirrorMode
    : selectors.notebook.codeMirrorMode(model);

  return {
    theme: selectors.userTheme(state),
    cellOrder: selectors.notebook.cellOrder(model),
    transforms: ownProps.transforms || defaultTransforms,
    displayOrder: ownProps.displayOrder || defaultDisplayOrder,
    codeMirrorMode,
    contentRef,
    kernelRef
  };
};

const mapDispatchToProps = (dispatch): NotebookDispatchProps => ({
  moveCell: (payload: *) => dispatch(actions.moveCell(payload)),
  focusCell: (payload: *) => dispatch(actions.focusCell(payload)),
  executeFocusedCell: (payload: *) =>
    dispatch(actions.executeFocusedCell(payload)),
  focusNextCell: (payload: *) => dispatch(actions.focusNextCell(payload)),
  focusNextCellEditor: (payload: *) =>
    dispatch(actions.focusNextCellEditor(payload))
});

export class NotebookApp extends React.PureComponent<NotebookProps> {
  static defaultProps = {
    theme: "light",
    displayOrder: defaultTransforms,
    transforms: defaultDisplayOrder
  };

  constructor(): void {
    super();
    (this: any).createCellElement = this.createCellElement.bind(this);
    (this: any).keyDown = this.keyDown.bind(this);
    (this: any).renderCell = this.renderCell.bind(this);
  }

  componentDidMount(): void {
    document.addEventListener("keydown", this.keyDown);
  }

  componentWillUnmount(): void {
    document.removeEventListener("keydown", this.keyDown);
  }

  keyDown(e: KeyboardEvent): void {
    // If enter is not pressed, do nothing
    if (e.keyCode !== 13) {
      return;
    }

    const {
      executeFocusedCell,
      focusNextCell,
      focusNextCellEditor,
      contentRef
    } = this.props;

    let ctrlKeyPressed = e.ctrlKey;
    // Allow cmd + enter (macOS) to operate like ctrl + enter
    if (process.platform === "darwin") {
      ctrlKeyPressed = (e.metaKey || e.ctrlKey) && !(e.metaKey && e.ctrlKey);
    }

    const shiftXORctrl =
      (e.shiftKey || ctrlKeyPressed) && !(e.shiftKey && ctrlKeyPressed);
    if (!shiftXORctrl) {
      return;
    }

    e.preventDefault();

    // NOTE: Order matters here because we need it to execute _before_ we
    // focus the next cell
    executeFocusedCell({ contentRef });

    if (e.shiftKey) {
      // Couldn't focusNextCell just do focusing of both?
      focusNextCell({ id: null, createCellIfUndefined: true, contentRef });
      focusNextCellEditor({ id: null, contentRef });
    }
  }

  renderCell(id: string): ?React$Element<any> {
    const { contentRef } = this.props;
    return (
      <ConnectedCell
        id={id}
        transforms={this.props.transforms}
        displayOrder={this.props.displayOrder}
        codeMirrorMode={this.props.codeMirrorMode}
        contentRef={contentRef}
      />
    );
  }

  createCellElement(id: string): React$Element<any> {
    const { moveCell, focusCell, contentRef } = this.props;
    return (
      <div className="cell-container" key={`cell-container-${id}`}>
        <DraggableCell
          moveCell={moveCell}
          id={id}
          focusCell={focusCell}
          contentRef={contentRef}
        >
          {this.renderCell(id)}
        </DraggableCell>
        <CellCreator
          key={`creator-${id}`}
          id={id}
          above={false}
          contentRef={contentRef}
        />
      </div>
    );
  }

  render(): ?React$Element<any> {
    return (
      <React.Fragment>
        <div className="cells">
          <CellCreator
            id={this.props.cellOrder.get(0)}
            above
            contentRef={this.props.contentRef}
          />
          {this.props.cellOrder.map(this.createCellElement)}
        </div>
        <StatusBar
          contentRef={this.props.contentRef}
          kernelRef={this.props.kernelRef}
        />
        <style jsx>{`
          .cells {
            padding-top: var(--nt-spacing-m, 10px);
            padding-left: var(--nt-spacing-m, 10px);
            padding-right: var(--nt-spacing-m, 10px);
          }
        `}</style>
        <style
          dangerouslySetInnerHTML={{
            __html: `
:root {
  ${themes[this.props.theme]};
}`
          }}
        >
          {}
        </style>
      </React.Fragment>
    );
  }
}

export const ConnectedNotebook = dragDropContext(HTML5Backend)(NotebookApp);
// $FlowFixMe: react-redux typings
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ConnectedNotebook);
