/* eslint-disable no-return-assign */
/* @flow */
import * as Immutable from "immutable";
import * as React from "react";
import * as selectors from "../selectors";
import { DragDropContext as dragDropContext } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";
import { connect } from "react-redux";
import {
  List as ImmutableList,
  Map as ImmutableMap,
  Set as ImmutableSet,
  isImmutable
} from "immutable";

import { HijackScroll } from "../components/hijack-scroll";

import MathJax from "@nteract/mathjax";

import MarkdownPreviewer from "../components/markdown-preview";
import Toolbar from "./toolbar";

import { Display, RichestMime } from "@nteract/display-area";

import CodeMirror from "./editor";

import { displayOrder, transforms } from "@nteract/transforms";

import { Input, Prompt, Editor, Pagers, Outputs, Cell } from "../components";

import DraggableCell from "../components/draggable-cell";
import CellCreator from "./cell-creator";
import StatusBar from "../components/status-bar";

import {
  PinnedPlaceHolderCell,
  StickyCellContainer
} from "../components/pinned-cell";

import * as actions from "../actions";

// NOTE: PropTypes are required for the sake of contextTypes
const PropTypes = require("prop-types");

const themes = require("../themes");

type AnyCellProps = {
  id: string,
  cellType: "markdown" | "code" | "raw",
  theme: string,
  source: string,
  executionCount: *,
  outputs: ImmutableList<*>,
  cellStatus: string,
  cellFocused: boolean, // not the ID of which is focused
  editorFocused: boolean,
  sourceHidden: boolean,
  outputHidden: boolean,
  outputExpanded: boolean,
  displayOrder: typeof displayOrder,
  transforms: typeof transforms,
  models: ImmutableMap<string, *>,
  codeMirrorMode: *,
  selectCell: () => void,
  focusEditor: () => void,
  unfocusEditor: () => void,
  focusAboveCell: () => void,
  focusBelowCell: () => void
};

const mapStateToCellProps = (state, { id }) => {
  const cellMap = selectors.currentCellMap(state);
  const cell = cellMap && cellMap.get(id);
  if (!cell) {
    throw new Error("cell not found inside cell map");
  }

  const cellType = cell.get("cell_type");
  const outputs = cell.get("outputs", ImmutableList());

  const sourceHidden =
    cellType === "code" &&
    (cell.getIn(["metadata", "inputHidden"], false) ||
      cell.getIn(["metadata", "hide_input"], false));

  const outputHidden =
    cellType === "code" &&
    (outputs.size === 0 || cell.getIn(["metadata", "outputHidden"]));

  const outputExpanded =
    cellType === "code" && cell.getIn(["metadata", "outputExpanded"]);

  return {
    cellType,
    source: cell.get("source", ""),
    theme: selectors.userPreferences(state).theme,
    executionCount: cell.get("execution_count"),
    outputs,
    models: selectors.models(state),
    cellFocused: selectors.currentFocusedCellId(state) === id,
    editorFocused: selectors.currentFocusedEditorId(state) === id,
    sourceHidden,
    outputHidden,
    outputExpanded,
    cellStatus: selectors.transientCellMap(state).getIn([id, "status"])
  };
};

const mapDispatchToCellProps = (dispatch, { id }) => ({
  selectCell: () => dispatch(actions.focusCell(id)),
  focusEditor: () => dispatch(actions.focusCellEditor(id)),
  unfocusEditor: () => dispatch(actions.focusCellEditor(null)),
  focusAboveCell: () => {
    dispatch(actions.focusPreviousCell(id));
    dispatch(actions.focusPreviousCellEditor(id));
  },
  focusBelowCell: () => {
    dispatch(actions.focusNextCell(id));
    dispatch(actions.focusNextCellEditor(id));
  }
});

class AnyCell extends React.PureComponent<AnyCellProps, *> {
  static contextTypes = {
    store: PropTypes.object
  };

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
      selectCell,
      unfocusEditor
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
              <Editor>
                <CodeMirror
                  tip
                  completion
                  id={id}
                  value={this.props.source}
                  cellFocused={cellFocused}
                  editorFocused={editorFocused}
                  theme={this.props.theme}
                  focusAbove={focusAboveCell}
                  focusBelow={focusBelowCell}
                  options={{
                    mode: isImmutable(this.props.codeMirrorMode)
                      ? this.props.codeMirrorMode.toJS()
                      : this.props.codeMirrorMode
                  }}
                />
              </Editor>
            </Input>
            <Outputs
              hidden={this.props.outputHidden}
              expanded={this.props.outputExpanded}
            >
              <Display
                className="outputs-display"
                outputs={this.props.outputs.toJS()}
                displayOrder={this.props.displayOrder}
                transforms={this.props.transforms}
                theme={this.props.theme}
                expanded={this.props.outputExpanded}
                isHidden={this.props.outputHidden}
                models={this.props.models.toJS()}
              />
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
            <Editor>
              <CodeMirror
                id={id}
                value={this.props.source}
                theme={this.props.theme}
                focusAbove={focusAboveCell}
                focusBelow={focusBelowCell}
                cellFocused={cellFocused}
                editorFocused={editorFocused}
                options={{
                  // Markdown should always be line wrapped
                  lineWrapping: true,
                  // Rely _directly_ on the codemirror mode
                  mode: {
                    name: "gfm",
                    tokenTypeOverrides: {
                      emoji: "emoji"
                    }
                  }
                }}
              />
            </Editor>
          </MarkdownPreviewer>
        );
        break;

      default:
        element = <pre>{this.props.source}</pre>;
        break;
    }

    return (
      <HijackScroll focused={cellFocused} onClick={selectCell}>
        <Cell isSelected={cellFocused}>
          <Toolbar type={cellType} id={id} source={this.props.source} />
          {element}
          <style jsx>{`
            /*
           * Show the cell-toolbar-mask if hovering on cell,
           * or cell was the last clicked (has .focused class).
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

export const ConnectedCell = connect(
  mapStateToCellProps,
  mapDispatchToCellProps
)(AnyCell);

type NotebookProps = {
  displayOrder: Array<string>,
  cellOrder: ImmutableList<any>,
  transforms: Object,
  stickyCells: ImmutableSet<string>,
  theme: string,
  lastSaved: Date,
  languageDisplayName: string,
  kernelStatus: string,
  codeMirrorMode: string | ImmutableMap<string, *>,
  moveCell: (sourceId: string, destinationId: string, above: boolean) => void,
  selectCell: (id: string) => void,
  executeFocusedCell: () => void,
  focusNextCell: () => void,
  focusNextCellEditor: () => void
};

const mapStateToProps = (state: Object, ownProps: NotebookProps) => {
  return {
    theme: selectors.userPreferences(state).theme,
    lastSaved: selectors.currentLastSaved(state),
    cellOrder: selectors.currentCellOrder(state) || Immutable.List(),
    stickyCells: selectors.currentStickyCells(state),
    kernelStatus: selectors.currentKernelStatus(state),
    languageDisplayName: selectors.currentDisplayName(state),
    transforms: ownProps.transforms || transforms,
    displayOrder: ownProps.displayOrder || displayOrder,
    codeMirrorMode: selectors.codeMirrorMode(state)
  };
};

const mapDispatchToProps = dispatch => ({
  moveCell: (sourceId: string, destinationId: string, above: boolean) =>
    dispatch(actions.moveCell(sourceId, destinationId, above)),
  selectCell: (id: string) => dispatch(actions.focusCell(id)),
  executeFocusedCell: () => dispatch(actions.executeFocusedCell()),
  focusNextCell: () => dispatch(actions.focusNextCell()),
  focusNextCellEditor: () => dispatch(actions.focusNextCellEditor())
});

export class NotebookApp extends React.PureComponent<NotebookProps> {
  static defaultProps = {
    displayOrder,
    transforms
  };

  static contextTypes = {
    store: PropTypes.object
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
      focusNextCellEditor
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
    executeFocusedCell();

    if (e.shiftKey) {
      // Couldn't focusNextCell just do focusing of both?
      focusNextCell();
      focusNextCellEditor();
    }
  }

  renderStickyCells(): React.Node {
    const cellOrder = this.props.cellOrder;
    const stickyCells = cellOrder.filter(id => this.props.stickyCells.get(id));
    if (stickyCells.size === 0) {
      return null;
    }

    return (
      <StickyCellContainer>
        {stickyCells.map(id => (
          <div key={`sticky-cell-container-${id}`} className="sticky-cell">
            {this.renderCell(id)}
          </div>
        ))}
        <style jsx>{`
          .sticky-cell {
            padding-right: 20px;
          }
        `}</style>
      </StickyCellContainer>
    );
  }

  renderCell(id: string): ?React$Element<any> {
    const { selectCell } = this.props;
    return (
      <ConnectedCell
        id={id}
        transforms={this.props.transforms}
        displayOrder={this.props.displayOrder}
        selectCell={selectCell}
        codeMirrorMode={this.props.codeMirrorMode}
      />
    );
  }

  createCellElement(id: string): React$Element<*> {
    const isStickied = this.props.stickyCells.get(id);
    const { moveCell, selectCell } = this.props;
    return (
      <div className="cell-container" key={`cell-container-${id}`}>
        {isStickied ? (
          <PinnedPlaceHolderCell />
        ) : (
          <DraggableCell moveCell={moveCell} id={id} selectCell={selectCell}>
            {this.renderCell(id)}
          </DraggableCell>
        )}
        <CellCreator key={`creator-${id}`} id={id} above={false} />
      </div>
    );
  }

  render(): ?React$Element<any> {
    return (
      <React.Fragment>
        {/* Sticky cells */}
        {this.renderStickyCells()}
        {/* Actual cells! */}
        <div className="cells">
          <CellCreator id={this.props.cellOrder.get(0)} above />
          {this.props.cellOrder.map(this.createCellElement)}
        </div>
        <StatusBar
          lastSaved={this.props.lastSaved}
          kernelSpecDisplayName={this.props.languageDisplayName}
          kernelStatus={this.props.kernelStatus}
        />
        <style jsx>{`
          .cells {
            padding-top: 10px;
            padding-left: 10px;
            padding-right: 10px;
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
export default connect(mapStateToProps, mapDispatchToProps)(ConnectedNotebook);
