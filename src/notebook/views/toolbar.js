// @flow
import React, { PureComponent } from 'react';
import Dropdown, { DropdownTrigger, DropdownContent } from 'react-simple-dropdown';

declare type ToolbarProps = {|
  cell: any,
  id: string,
  type: string,
  executeCell: () => void,
  removeCell: () => void,
  toggleStickyCell: () => void,
  clearOutputs: () => void,
  changeInputVisibility: () => void,
  changeOutputVisibility: (dropdown: Dropdown) => void,
  toggleOutputExpansion: () => void,
  changeCellType: () => void
|};

const renderToolbar = ({
  type,
  dropdown,
  executeCell,
  removeCell,
  toggleStickyCell,
  clearOutputs,
  changeInputVisibility,
  changeOutputVisibility,
  toggleOutputExpansion,
  changeCellType
}: ToolbarProps) => {
    let dropdownRef;
    return (
    <div className="cell-toolbar-mask">
      <div className="cell-toolbar">
        {type !== 'markdown' &&
        <span>
          <button
            onClick={executeCell}
            title="execute cell"
            className="executeButton"
          >
            <span className="octicon octicon-triangle-right" />
          </button>
        </span>}
        <button
          onClick={toggleStickyCell}
          title="pin cell"
          className="stickyButton"
        >
          <span className="octicon octicon-pin" />
        </button>
        <button
          onClick={removeCell}
          title="delete cell"
          className="deleteButton"
        >
          <span className="octicon octicon-trashcan" />
        </button>
        <Dropdown ref={(dropdown) => { dropdownRef = dropdown; }}>
          <DropdownTrigger>
            <button title="show additional actions">
              <span className="octicon octicon-chevron-down" />
            </button>
          </DropdownTrigger>
          <DropdownContent>
            {
            ( type === 'code') ?
              <ul>
                <li onClick={() => clearOutputs(dropdownRef)} className="clearOutput" >
                  <a>Clear Cell Output</a>
                </li>
                <li onClick={() => changeInputVisibility(dropdownRef)} className="inputVisibility" >
                  <a>Toggle Input Visibility</a>
                </li>
                <li onClick={() => changeOutputVisibility(dropdownRef)} className="outputVisibility" >
                  <a>Toggle Output Visibility</a>
                </li>
                <li onClick={() => toggleOutputExpansion(dropdownRef)} className="outputExpanded" >
                  <a>Toggle Expanded Output</a>
                </li>
              </ul> : null
            }
            <ul>
              <li onClick={() => changeCellType(dropdownRef)} className="changeType" >
                <a>
                  Convert to {type === 'markdown' ? 'Code' : 'Markdown'} Cell
                </a>
              </li>
            </ul>
          </DropdownContent>
        </Dropdown>
      </div>
    </div>
  );
};


export default class Toolbar extends PureComponent {
  props: ToolbarProps;

  render(): React.Element<any> {
    return renderToolbar(this.props);
  }
}
