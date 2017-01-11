// @flow
import React, { PureComponent } from 'react';
import Dropdown, { DropdownTrigger, DropdownContent } from 'react-simple-dropdown';

declare type ToolbarProps = {|
  cell: any,
  id: string,
  type: string,
  dropdown: Dropdown,
  executeCell: () => void,
  removeCell: () => void,
  toggleStickyCell: () => void,
  clearOutputs: () => void,
  changeInputVisibility: () => void,
  changeOutputVisibility: () => void,
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
}: ToolbarProps) => (
  <div className="cell-toolbar-mask">
    <div className="cell-toolbar">
      {type !== 'markdown' &&
      <span>
        <button onClick={() => executeCell()} className="executeButton" >
          <span className="octicon octicon-triangle-right" />
        </button>
      </span>}
      <button onClick={() => removeCell()} className="deleteButton" >
        <span className="octicon octicon-trashcan" />
      </button>
      <button onClick={() => toggleStickyCell()} className="stickyButton" >
        <span className="octicon octicon-pin" />
      </button>
      <Dropdown ref={(dropdown) => { this.dropdown = dropdown; }}>
        <DropdownTrigger>
          <button>
            <span className="octicon octicon-chevron-down" />
          </button>
        </DropdownTrigger>
        <DropdownContent>
          {
          (type === 'code') ?
            <ul>
              <li onClick={() => clearOutputs()} className="clearOutput" >
                <a>Clear Cell Output</a>
              </li>
              <li onClick={() => changeInputVisibility()} className="inputVisibility" >
                <a>Toggle Input Visibility</a>
              </li>
              <li onClick={() => changeOutputVisibility()} className="outputVisibility" >
                <a>Toggle Output Visibility</a>
              </li>
              <li onClick={() => toggleOutputExpansion()} className="outputExpanded" >
                <a>Toggle Expanded Output</a>
              </li>
            </ul> : null
          }
          <ul>
            <li onClick={() => changeCellType()} className="changeType" >
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

export default class Toolbar extends PureComponent {
  props: ToolbarProps;

  render(): React.Element<any> {
    return renderActionButtons(this.props);
  }
}
