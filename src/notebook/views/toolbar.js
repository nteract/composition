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

declare type ToolbarProps = {|
  cell: any,
  id: string,
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

export default class Toolbar extends PureComponent {
  props: ToolbarProps;
  clearOutputs: () => void;
  changeInputVisibility: () => void;
  changeOutputVisibility: () => void;
  changeCellType: () => void;
  toggleOutputExpansion: () => void;
  renderToolbar: () => React.Element<any>;
  dropdown: any;
  constructor(props: ToolbarProps) {
    super(props);
    this.renderToolbar = this.renderToolbar.bind(this);
    this.clearOutputs = this.clearOutputs.bind(this);
    this.changeInputVisibility = this.changeInputVisibility.bind(this);
    this.changeOutputVisibility = this.changeOutputVisibility.bind(this);
    this.toggleOutputExpansion = this.toggleOutputExpansion.bind(this);
    this.changeCellType = this.changeCellType.bind(this);
  }

  renderToolbar({
    type,
    executeCell,
    removeCell,
    toggleStickyCell
  }: ToolbarProps) {
    return (
      <div className="cell-toolbar-mask">
        <div className="cell-toolbar">
          {type !== "markdown" &&
            <div>
              <button
                onClick={executeCell}
                title="execute cell"
                className="executeButton"
              >
                <span className="octicon octicon-triangle-right" />
              </button>
            </div>}
          <div>
            <button
              onClick={toggleStickyCell}
              title="pin cell"
              className="stickyButton"
            >
              <span className="octicon octicon-pin" />
            </button>
          </div>
          <div>
            <button
              onClick={removeCell}
              title="delete cell"
              className="deleteButton"
            >
              <span className="octicon octicon-trashcan" />
            </button>
          </div>
          <Dropdown
            ref={dropdown => {
              this.dropdown = dropdown;
            }}
          >
            <DropdownTrigger>
              <button title="show additional actions">
                <span className="octicon octicon-chevron-down" />
              </button>
            </DropdownTrigger>
            <DropdownContent>
              {type === "code"
                ? <ul role="listbox" tabIndex="0">
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
                : null}
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
      </div>
    );
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
  render(): React.Element<any> {
    return this.renderToolbar(this.props);
  }
}
