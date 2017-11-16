// @flow
/* eslint jsx-a11y/no-static-element-interactions: 0 */
/* eslint jsx-a11y/click-events-have-key-events: 0 */
/* eslint jsx-a11y/anchor-is-valid: 0 */

// TODO: Fix up a11y eslint here
// TODO: All the `<li>` below that have role button should just be `<button>` with proper styling

import React, { PureComponent } from "react";
import Dropdown, {
  DropdownTrigger,
  DropdownContent
} from "react-simple-dropdown";

import {
  PinOcticon,
  TrashOcticon,
  ChevronDownOcticon,
  TriangleRightOcticon
} from "./octicons";

declare type ToolbarProps = {|
  type: string,
  executeCell: () => void,
  removeCell: () => void,
  toggleStickyCell: () => void,
  clearOutputs: () => void,
  changeInputVisibility: () => void,
  changeOutputVisibility: () => void,
  toggleOutputExpansion: () => void,
  changeCellType: () => void
|};

export default class Toolbar extends PureComponent<ToolbarProps> {
  clearOutputs: () => void;
  changeInputVisibility: () => void;
  changeOutputVisibility: () => void;
  changeCellType: () => void;
  toggleOutputExpansion: () => void;
  dropdown: any;
  constructor(props: ToolbarProps) {
    super(props);
    this.clearOutputs = this.clearOutputs.bind(this);
    this.changeInputVisibility = this.changeInputVisibility.bind(this);
    this.changeOutputVisibility = this.changeOutputVisibility.bind(this);
    this.toggleOutputExpansion = this.toggleOutputExpansion.bind(this);
    this.changeCellType = this.changeCellType.bind(this);
  }

  clearOutputs(): void {
    this.dropdown.hide();
    this.props.clearOutputs();
  }

  changeOutputVisibility(): void {
    this.dropdown.hide();
    this.props.changeOutputVisibility();
  }

  changeInputVisibility(): void {
    this.dropdown.hide();
    this.props.changeInputVisibility();
  }

  toggleOutputExpansion(): void {
    this.dropdown.hide();
    this.props.toggleOutputExpansion();
  }

  changeCellType(): void {
    this.dropdown.hide();
    this.props.changeCellType();
  }
  render(): React$Element<any> {
    const { type, executeCell, removeCell, toggleStickyCell } = this.props;

    return (
      <div className="cell-toolbar-mask">
        <div className="cell-toolbar">
          {type !== "markdown" && (
            <div>
              <button
                onClick={executeCell}
                title="execute cell"
                className="executeButton"
              >
                <span className="octicon">
                  <TriangleRightOcticon />
                </span>
              </button>
            </div>
          )}
          <div>
            <button
              onClick={toggleStickyCell}
              title="pin cell"
              className="stickyButton"
            >
              <span className="octicon">
                <PinOcticon />
              </span>
            </button>
          </div>
          <div>
            <button
              onClick={removeCell}
              title="delete cell"
              className="deleteButton"
            >
              <span className="octicon">
                <TrashOcticon />
              </span>
            </button>
          </div>
          <Dropdown
            ref={dropdown => {
              this.dropdown = dropdown;
            }}
          >
            <DropdownTrigger>
              <button title="show additional actions">
                <span className="octicon">
                  <ChevronDownOcticon />
                </span>
              </button>
            </DropdownTrigger>
            <DropdownContent>
              {type === "code" ? (
                <ul role="listbox" tabIndex="0">
                  <li
                    onClick={() => this.clearOutputs()}
                    className="clearOutput"
                    role="option"
                    aria-selected="false"
                    tabIndex="0"
                  >
                    <a>Clear Cell Output</a>
                  </li>
                  <li
                    onClick={() => this.changeInputVisibility()}
                    className="inputVisibility"
                    role="option"
                    aria-selected="false"
                    tabIndex="0"
                  >
                    <a>Toggle Input Visibility</a>
                  </li>
                  <li
                    onClick={() => this.changeOutputVisibility()}
                    className="outputVisibility"
                    role="option"
                    aria-selected="false"
                    tabIndex="0"
                  >
                    <a>Toggle Output Visibility</a>
                  </li>
                  <li
                    onClick={() => this.toggleOutputExpansion()}
                    className="outputExpanded"
                    role="option"
                    aria-selected="false"
                    tabIndex="0"
                  >
                    <a>Toggle Expanded Output</a>
                  </li>
                </ul>
              ) : null}
              <ul role="listbox" tabIndex="0">
                <li
                  onClick={() => this.changeCellType()}
                  className="changeType"
                  role="option"
                  aria-selected="false"
                  tabIndex="0"
                >
                  <a>
                    Convert to {type === "markdown" ? "Code" : "Markdown"} Cell
                  </a>
                </li>
              </ul>
            </DropdownContent>
          </Dropdown>
        </div>

        <style jsx>{`
          .cell-toolbar > div {
            display: inline-block;
          }

          .cell-toolbar {
            background-color: var(--toolbar-bg);
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

          .cell-toolbar button span {
            font-size: 15px;
            line-height: 1;
            color: var(--toolbar-button);
          }

          .cell-toolbar button span:hover {
            color: var(--toolbar-button-hover);
          }

          .cell-toolbar-mask {
            display: none;
            position: absolute;
            top: 0px;
            right: 0px;
            z-index: 99;
            height: 34px;

            /* Set the left padding to 50px to give users extra room to move their
              mouse to the toolbar without causing the cell to go out of focus and thus
              hide the toolbar before they get there. */
            padding: 0px 0px 0px 50px;
          }

          .octicon {
            transition: color 0.5s;
          }
        `}</style>
      </div>
    );
  }
}
