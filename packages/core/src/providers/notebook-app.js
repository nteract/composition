/* eslint-disable no-return-assign */
/* @flow */
import * as React from "react";
import { DragDropContext as dragDropContext } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";
import { connect } from "react-redux";
import {
  List as ImmutableList,
  Map as ImmutableMap,
  Set as ImmutableSet
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
  executeCell
} from "../actions";

// NOTE: PropTypes are required for the sake of contextTypes
const PropTypes = require("prop-types");

const themes = require("../themes");

type Props = {
  displayOrder: Array<string>,
  // TODO: Make types stricter, we have definitions _somewhere_
  cellOrder: ImmutableList<any>,
  cellMap: ImmutableMap<string, any>,
  transforms: Object,
  cellPagers: ImmutableMap<string, any>,
  stickyCells: ImmutableSet<string>,
  transient: ImmutableMap<string, any>,
  cellFocused: string,
  editorFocused: string,
  theme: string,
  lastSaved: Date,
  kernelSpecDisplayName: string,
  executionState: string,
  models: ImmutableMap<string, any>,
  language: string
};

export function getLanguageMode(metadata: ImmutableMap<*, *>): string {
  // First try codemirror_mode, then name, and fallback to 'text'
  const language = metadata.getIn(
    ["language_info", "codemirror_mode", "name"],
    metadata.getIn(
      ["language_info", "codemirror_mode"],
      metadata.getIn(["language_info", "name"], "text")
    )
  );
  return language;
}

const mapStateToProps = (state: Object) => ({
  theme: state.config.get("theme"),
  lastSaved: state.app.get("lastSaved"),
  kernelSpecDisplayName: state.app.get("kernelSpecDisplayName"),
  cellOrder: state.document.getIn(["notebook", "cellOrder"], ImmutableList()),
  cellMap: state.document.getIn(["notebook", "cellMap"], ImmutableMap()),
  transient: state.document.get("transient"),
  cellPagers: state.document.get("cellPagers", ImmutableMap()),
  cellFocused: state.document.get("cellFocused"),
  editorFocused: state.document.get("editorFocused"),
  stickyCells: state.document.get("stickyCells"),
  executionState: state.app.get("executionState"),
  models: state.comms.get("models"),
  language: getLanguageMode(
    state.document.getIn(["notebook", "metadata"], ImmutableMap())
  )
});

export class NotebookApp extends React.Component<Props> {
  static defaultProps = {
    displayOrder,
    transforms,
    models: ImmutableMap(),
    language: "python"
  };

  static contextTypes = {
    store: PropTypes.object
  };

  constructor(): void {
    super();
    (this: any).createCellElement = this.createCellElement.bind(this);
    (this: any).keyDown = this.keyDown.bind(this);
    (this: any).moveCell = this.moveCell.bind(this);
    (this: any).selectCell = this.selectCell.bind(this);
    (this: any).renderCell = this.renderCell.bind(this);
  }

  componentDidMount(): void {
    document.addEventListener("keydown", this.keyDown);
  }

  componentWillUnmount(): void {
    document.removeEventListener("keydown", this.keyDown);
  }

  moveCell(sourceId: string, destinationId: string, above: boolean): void {
    this.context.store.dispatch(moveCell(sourceId, destinationId, above));
  }

  selectCell(id: string): void {
    this.context.store.dispatch(focusCell(id));
  }

  keyDown(e: KeyboardEvent): void {
    // If enter is not pressed, do nothing
    if (e.keyCode !== 13) {
      return;
    }

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

    if (!this.props.cellFocused) {
      return;
    }

    e.preventDefault();

    const cellMap = this.props.cellMap;
    const id = this.props.cellFocused;
    const cell = cellMap.get(id);

    if (!cell) {
      return;
    }

    if (e.shiftKey && !this.props.stickyCells.has(id)) {
      this.context.store.dispatch(focusNextCell(this.props.cellFocused, true));
      this.context.store.dispatch(focusNextCellEditor(id));
    }

    if (cell.get("cell_type") === "code") {
      this.context.store.dispatch(executeCell(id, cell.get("source")));
    }
  }

  renderStickyCells(): React.Node {
    const cellOrder = this.props.cellOrder;
    const stickyCells = cellOrder.filter(id => this.props.stickyCells.get(id));

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
    const cell = this.props.cellMap.get(id);

    if (!cell) {
      return null;
    }

    const running =
      this.props.transient.getIn(["cellMap", id, "status"]) === "busy";

    const cellType = cell.get("cell_type");

    // TODO: Figure out nomenclature
    const cellFocused = this.props.cellFocused === id;
    const editorFocused = this.props.editorFocused === id;

    let element = null;

    const selectCell = () => {
      this.context.store.dispatch(focusCell(id));
    };
    const focusEditor = () => {
      this.context.store.dispatch(focusCellEditor(id));
    };

    const unfocusEditor = () => {
      this.context.store.dispatch(focusCellEditor(null));
    };

    const focusAboveCell = () => {
      this.context.store.dispatch(focusPreviousCell(id));
      this.context.store.dispatch(focusPreviousCellEditor(id));
    };
    const focusBelowCell = () => {
      this.context.store.dispatch(focusNextCell(id, true));
      this.context.store.dispatch(focusNextCellEditor(id));
    };

    switch (cellType) {
      case "code":
        const sourceHidden =
          cell.getIn(["metadata", "inputHidden"], false) ||
          cell.getIn(["metadata", "hide_input"], false);

        const outputHidden =
          cell.get("outputs").size === 0 ||
          cell.getIn(["metadata", "outputHidden"]);
        const outputExpanded = cell.getIn(["metadata", "outputExpanded"]);

        element = (
          <React.Fragment>
            <Input hidden={sourceHidden}>
              <Prompt counter={cell.get("execution_count")} running={running} />
              <Editor>
                <CodeMirror
                  tip
                  completion
                  id={id}
                  value={cell.get("source")}
                  language={this.props.language}
                  cellFocused={cellFocused}
                  editorFocused={editorFocused}
                  theme={this.props.theme}
                  focusAbove={focusAboveCell}
                  focusBelow={focusBelowCell}
                />
              </Editor>
            </Input>
            <Pagers>
              {this.props.cellPagers
                .get(id, ImmutableList())
                .map((pager, key) => (
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
              <Outputs hidden={outputHidden} expanded={outputExpanded}>
                <Display
                  className="outputs-display"
                  outputs={cell.get("outputs").toJS()}
                  displayOrder={this.props.displayOrder}
                  transforms={this.props.transforms}
                  theme={this.props.theme}
                  expanded={outputExpanded}
                  isHidden={outputHidden}
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
            focusAbove={focusAboveCell}
            focusBelow={focusBelowCell}
            focusEditor={focusEditor}
            cellFocused={cellFocused}
            editorFocused={editorFocused}
            unfocusEditor={unfocusEditor}
            source={cell.get("source", "")}
          >
            <Editor>
              <CodeMirror
                language="markdown"
                id={id}
                value={cell.get("source")}
                theme={this.props.theme}
                focusAbove={focusAboveCell}
                focusBelow={focusBelowCell}
                cellFocused={cellFocused}
                editorFocused={editorFocused}
                options={{
                  // Markdown should always be line wrapped
                  lineWrapping: true
                }}
              />
            </Editor>
          </MarkdownPreviewer>
        );
        break;

      default:
        element = <pre>{cell.get("source")}</pre>;
        break;
    }

    return (
      <HijackScroll focused={cellFocused} onClick={selectCell} key={id}>
        <Cell isSelected={cellFocused}>
          <Toolbar type={cellType} cell={cell} id={id} />
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
      <div>
        {/* Sticky cells */}
        {this.renderStickyCells()}
        {/* Actual cells! */}
        <div className="cells">
          <CellCreator id={this.props.cellOrder.get(0)} above />
          {this.props.cellOrder.map(id => (
            <div key={id}>{this.createCellElement(id)}</div>
          ))}
        </div>
        <StatusBar
          lastSaved={this.props.lastSaved}
          kernelSpecDisplayName={this.props.kernelSpecDisplayName}
          executionState={this.props.executionState}
        />
        <style jsx>{`
          .cells {
            padding-top: 10px;
            padding-left: 10px;
            padding-right: 10px;
          }
        `}</style>
      </div>
    );
  }
}

export const ConnectedNotebook = dragDropContext(HTML5Backend)(NotebookApp);
// $FlowFixMe: Flow can't figure out what to do with connect with one param.
export default connect(mapStateToProps)(ConnectedNotebook);
