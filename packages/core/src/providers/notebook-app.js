/* eslint-disable no-return-assign */
/* @flow */
import * as React from "react";
import { DragDropContext as dragDropContext } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";
import { connect } from "react-redux";
import {
  List as ImmutableList,
  Map as ImmutableMap,
  Set as ImmutableSet,
  isImmutable
} from "immutable";

import LatexRenderer from "../components/latex";

import { HijackScroll } from "../components/hijack-scroll";

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

import {
  focusCellEditor,
  focusPreviousCell,
  focusPreviousCellEditor,
  focusNextCell,
  focusNextCellEditor,
  moveCell,
  focusCell,
  executeCell,
  executeFocusedCell
} from "../actions";

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
  pager: ImmutableList<*>,
  cellStatus: string,
  cellFocused: boolean, // not the ID of which is focused
  editorFocused: boolean,
  sourceHidden: boolean,
  outputHidden: boolean,
  outputExpanded: boolean,
  displayOrder: typeof displayOrder,
  transforms: typeof transforms,
  models: ImmutableMap<string, *>,
  codeMirrorMode: *
};

const mapStateToCellProps = (state: Object, ownProps: *): AnyCellProps => {
  const id = ownProps.id;
  const cell = state.document.getIn(["notebook", "cellMap", id]);

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
    ...ownProps,
    id,
    cellType,
    source: cell.get("source", ""),
    theme: state.config.get("theme"),
    executionCount: cell.get("execution_count"),
    outputs,
    models: state.comms.get("models"),
    pager: state.document.getIn(["cellPagers", id], ImmutableList()),
    cellFocused: state.document.get("cellFocused") === id,
    editorFocused: state.document.get("editorFocused") === id,
    sourceHidden,
    outputHidden,
    outputExpanded,
    cellStatus: state.document.getIn(["transient", "cellMap", id, "status"])
  };
};

class AnyCell extends React.PureComponent<AnyCellProps, *> {
  static contextTypes = {
    store: PropTypes.object
  };

  selectCell = () => {
    this.context.store.dispatch(focusCell(this.props.id));
  };
  focusEditor = () => {
    this.context.store.dispatch(focusCellEditor(this.props.id));
  };

  unfocusEditor = () => {
    this.context.store.dispatch(focusCellEditor(null));
  };

  focusAboveCell = () => {
    this.context.store.dispatch(focusPreviousCell(this.props.id));
    this.context.store.dispatch(focusPreviousCellEditor(this.props.id));
  };

  focusBelowCell = () => {
    this.context.store.dispatch(focusNextCell(this.props.id, true));
    this.context.store.dispatch(focusNextCellEditor(this.props.id));
  };

  render(): ?React$Element<any> {
    const id = this.props.id;
    const cellStatus = this.props.cellStatus;

    const running = cellStatus === "busy";
    const queued = cellStatus === "queued";

    const cellType = this.props.cellType;

    const cellFocused = this.props.cellFocused;
    const editorFocused = this.props.editorFocused;

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
                  focusAbove={this.focusAboveCell}
                  focusBelow={this.focusBelowCell}
                  options={{
                    mode: isImmutable(this.props.codeMirrorMode)
                      ? this.props.codeMirrorMode.toJS()
                      : this.props.codeMirrorMode
                  }}
                />
              </Editor>
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
            <LatexRenderer>
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
            </LatexRenderer>
          </React.Fragment>
        );

        break;
      case "markdown":
        element = (
          <MarkdownPreviewer
            focusAbove={this.focusAboveCell}
            focusBelow={this.focusBelowCell}
            focusEditor={this.focusEditor}
            cellFocused={cellFocused}
            editorFocused={editorFocused}
            unfocusEditor={this.unfocusEditor}
            source={this.props.source}
          >
            <Editor>
              <CodeMirror
                id={id}
                value={this.props.source}
                theme={this.props.theme}
                focusAbove={this.focusAboveCell}
                focusBelow={this.focusBelowCell}
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
      <HijackScroll focused={cellFocused} onClick={this.selectCell}>
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

export const ConnectedCell = connect(mapStateToCellProps)(AnyCell);

type NotebookProps = {
  displayOrder: Array<string>,
  cellOrder: ImmutableList<any>,
  transforms: Object,
  stickyCells: ImmutableSet<string>,
  theme: string,
  lastSaved: Date,
  languageDisplayName: string,
  kernelStatus: string,
  codeMirrorMode: string | ImmutableMap<string, *>
};

export function getCodeMirrorMode(
  metadata: ImmutableMap<string, *>
): string | ImmutableMap<string, *> {
  let mode = metadata.getIn(
    // CodeMirror mode should be most valid
    ["language_info", "codemirror_mode"],
    metadata.getIn(
      // Kernel_info's language is the next best
      ["kernel_info", "language"],
      // If the kernelspec is encoded, grab the language
      metadata.getIn(
        ["kernelspec", "language"],
        // Otherwise just fallback to "text"
        "text"
      )
    )
  );

  return mode;
}

const mapStateToProps = (
  state: Object,
  ownProps: NotebookProps
): NotebookProps => {
  const codeMirrorMode = getCodeMirrorMode(
    state.document.getIn(["notebook", "metadata"], ImmutableMap())
  );

  return {
    theme: state.config.get("theme"),
    lastSaved: state.app.get("lastSaved"),
    cellOrder: state.document.getIn(["notebook", "cellOrder"], ImmutableList()),
    stickyCells: state.document.get("stickyCells"),
    kernelStatus: state.app.getIn(["kernel", "status"], "not connected"),
    languageDisplayName: state.document.getIn(
      ["notebook", "metadata", "kernelspec", "display_name"],
      ""
    ),
    transforms: ownProps.transforms || transforms,
    displayOrder: ownProps.displayOrder || displayOrder,
    codeMirrorMode
  };
};

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
    (this: any).moveCell = this.moveCell.bind(this);
    (this: any).selectCell = this.selectCell.bind(this);
    (this: any).renderCell = this.renderCell.bind(this);
  }

  moveCell(sourceId: string, destinationId: string, above: boolean): void {
    this.context.store.dispatch(moveCell(sourceId, destinationId, above));
  }

  selectCell(id: string): void {
    this.context.store.dispatch(focusCell(id));
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
    return (
      <ConnectedCell
        id={id}
        transforms={this.props.transforms}
        displayOrder={this.props.displayOrder}
        selectCell={this.selectCell}
        codeMirrorMode={this.props.codeMirrorMode}
      />
    );
  }

  createCellElement(id: string): React$Element<*> {
    const isStickied = this.props.stickyCells.get(id);

    return (
      <div className="cell-container" key={`cell-container-${id}`}>
        {isStickied ? (
          <PinnedPlaceHolderCell />
        ) : (
          <DraggableCell
            moveCell={this.moveCell}
            id={id}
            selectCell={this.selectCell}
          >
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
export default connect(mapStateToProps)(ConnectedNotebook);
