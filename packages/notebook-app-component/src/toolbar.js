// @flow
/* eslint jsx-a11y/no-static-element-interactions: 0 */
/* eslint jsx-a11y/click-events-have-key-events: 0 */
/* eslint jsx-a11y/anchor-is-valid: 0 */

// TODO: Fix up a11y eslint here
// TODO: All the `<li>` below that have role button should just be `<button>` with proper styling

import * as React from "react";
import { connect } from "react-redux";
import { actions } from "@nteract/core";
import type { ContentRef } from "@nteract/core";
import {
  DropdownMenu,
  DropdownTrigger,
  DropdownContent
} from "@nteract/dropdown-menu";
import {
  TrashOcticon,
  ChevronDownOcticon,
  TriangleRightOcticon
} from "@nteract/octicons";

export type PureToolbarProps = {|
  type: "markdown" | "code" | "raw",
  executeCell: ?() => void,
  deleteCell: ?() => void,
  clearOutputs: ?() => void,
  toggleParameterCell: ?() => void,
  toggleCellInputVisibility: ?() => void,
  toggleCellOutputVisibility: ?() => void,
  toggleOutputExpansion: ?() => void,
  changeCellType: ?() => void,
  sourceHidden: boolean,
  contentRef: ContentRef
|};

export class PureToolbar extends React.Component<PureToolbarProps> {
  static defaultProps = {
    type: "code"
  };

  render(): React$Element<any> {
    const { type, executeCell, deleteCell, sourceHidden } = this.props;

    return (
      <div className="cell-toolbar-mask">
        <div className="cell-toolbar">
          {type !== "markdown" && (
            <button
              onClick={executeCell}
              title="execute cell"
              className="executeButton"
            >
              <span className="octicon">
                <TriangleRightOcticon />
              </span>
            </button>
          )}
          <DropdownMenu>
            <DropdownTrigger>
              <button title="show additional actions">
                <span className="octicon toggle-menu">
                  <ChevronDownOcticon />
                </span>
              </button>
            </DropdownTrigger>
            {type === "code" ? (
              <DropdownContent>
                <li
                  onClick={this.props.clearOutputs}
                  className="clearOutput"
                  role="option"
                  aria-selected="false"
                  tabIndex="0"
                >
                  <a>Clear Cell Output</a>
                </li>
                <li
                  onClick={this.props.toggleCellInputVisibility}
                  className="inputVisibility"
                  role="option"
                  aria-selected="false"
                  tabIndex="0"
                >
                  <a>Toggle Input Visibility</a>
                </li>
                <li
                  onClick={this.props.toggleCellOutputVisibility}
                  className="outputVisibility"
                  role="option"
                  aria-selected="false"
                  tabIndex="0"
                >
                  <a>Toggle Output Visibility</a>
                </li>
                <li
                  onClick={this.props.toggleOutputExpansion}
                  className="outputExpanded"
                  role="option"
                  aria-selected="false"
                  tabIndex="0"
                >
                  <a>Toggle Expanded Output</a>
                </li>
                <li
                  onClick={this.props.toggleParameterCell}
                  role="option"
                  aria-selected="false"
                  tabIndex="0"
                >
                  <a>Toggle Parameter Cell</a>
                </li>

                <li
                  onClick={this.props.changeCellType}
                  className="changeType"
                  role="option"
                  aria-selected="false"
                  tabIndex="0"
                >
                  <a>Convert to Markdown Cell</a>
                </li>
              </DropdownContent>
            ) : (
              <DropdownContent>
                <li
                  onClick={this.props.changeCellType}
                  className="changeType"
                  role="option"
                  aria-selected="false"
                  tabIndex="0"
                >
                  <a>Convert to Code Cell</a>
                </li>
              </DropdownContent>
            )}
          </DropdownMenu>
          <span className="spacer" />
          <button
            onClick={deleteCell}
            title="delete cell"
            className="deleteButton"
          >
            <span className="octicon">
              <TrashOcticon />
            </span>
          </button>
        </div>

        <style jsx>{`
          .cell-toolbar > div {
            display: inline-block;
          }

          .cell-toolbar {
            background-color: var(--theme-cell-toolbar-bg);
            opacity: 0.4;
            transition: opacity 0.4s;
          }

          .cell-toolbar:hover {
            opacity: 1;
          }

          .cell-toolbar button {
            display: inline-block;

            width: 22px;
            height: 20px;
            padding: 0px 4px;

            text-align: center;

            border: none;
            outline: none;
            background: none;
          }

          .cell-toolbar span {
            font-size: 15px;
            line-height: 1;
            color: var(--theme-cell-toolbar-fg);
          }

          .cell-toolbar button span:hover {
            color: var(--theme-cell-toolbar-fg-hover);
          }

          .cell-toolbar-mask {
            z-index: 9999;
            display: ${sourceHidden ? "block" : "none"};
            position: absolute;
            top: 0px;
            right: 0px;
            height: 34px;

            /* Set the left padding to 50px to give users extra room to move their
              mouse to the toolbar without causing the cell to go out of focus and thus
              hide the toolbar before they get there. */
            padding: 0px 0px 0px 50px;
          }

          .octicon {
            transition: color 0.5s;
          }

          .cell-toolbar span.spacer {
            display: inline-block;
            vertical-align: middle;
            margin: 1px 5px 3px 5px;
            height: 11px;
          }
        `}</style>
      </div>
    );
  }
}

// eslint-disable-next-line no-unused-vars
type ConnectedProps = {
  id: string,
  type: "markdown" | "code" | "raw",
  executeCell: () => void,
  deleteCell: () => void,
  clearOutputs: () => void,
  toggleCellOutputVisibility: () => void,
  toggleCellInputVisibility: () => void,
  changeCellType: () => void,
  toggleOutputExpansion: () => void
};

const mapDispatchToProps = (dispatch, { id, type, contentRef }) => ({
  toggleParameterCell: () =>
    dispatch(actions.toggleParameterCell({ id, contentRef })),
  deleteCell: () => dispatch(actions.deleteCell({ id, contentRef })),
  executeCell: () => dispatch(actions.executeCell({ id, contentRef })),
  clearOutputs: () => dispatch(actions.clearOutputs({ id, contentRef })),
  toggleCellOutputVisibility: () =>
    dispatch(actions.toggleCellOutputVisibility({ id, contentRef })),
  toggleCellInputVisibility: () =>
    dispatch(actions.toggleCellInputVisibility({ id, contentRef })),
  changeCellType: () =>
    dispatch(
      actions.changeCellType({
        id,
        to: type === "markdown" ? "code" : "markdown",
        contentRef
      })
    ),
  toggleOutputExpansion: () =>
    dispatch(actions.toggleOutputExpansion({ id, contentRef }))
});

// TODO: This toolbar could easily make use of ownProps (contentRef, cellId)
//       and pluck exactly the state it wants
// $FlowFixMe: react-redux typings
export default connect(
  null,
  mapDispatchToProps
)(PureToolbar);
