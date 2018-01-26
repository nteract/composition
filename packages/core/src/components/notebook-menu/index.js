// @flow
import * as React from "react";
import Menu, { SubMenu, Divider, MenuItem } from "rc-menu";
import { localCss } from "./styles";
import { connect } from "react-redux";
import * as Immutable from "immutable";
import * as actions from "../../actions";
import { ACTIONS, MENUS } from "./constants";

// To allow actions that can take dynamic arguments (like selecting a kernel
// based on the host's kernelspecs), we have some simple utility functions to
// stringify/parse actions/arguments.
const createActionKey = (action, ...args) => [action, ...args].join(":");
const parseActionKey = key => key.split(":");

type Props = {
  defaultOpenKeys?: Array<string>,
  openKeys?: Array<string>,
  cellFocused: ?string,
  cellMap: Immutable.Map<string, *>,
  cellOrder: Immutable.List<string>,
  executeCell: ?(cellId: ?string) => void,
  cutCell: ?(cellId: ?string) => void,
  copyCell: ?(cellId: ?string) => void,
  pasteCell: ?() => void,
  createCodeCell: ?(cellId: ?string) => void,
  createMarkdownCell: ?(cellId: ?string) => void,
  setCellTypeCode: ?(cellId: ?string) => void,
  setCellTypeMarkdown: ?(cellId: ?string) => void
};

class PureNotebookMenu extends React.Component<Props> {
  static defaultProps = {
    cellFocused: null,
    cellMap: Immutable.Map(),
    cellOrder: Immutable.List(),
    executeCell: null,
    cutCell: null,
    copyCell: null,
    pasteCell: null,
    createCodeCell: null,
    createMarkdownCell: null,
    setCellTypeCode: null,
    setCellTypeMarkdown: null
  };
  executeCells = (cellIds: Immutable.List<string>) => {
    const { executeCell } = this.props;
    if (executeCell) {
      cellIds.forEach(cellId => executeCell(cellId));
    }
  };
  executeAllCellsBelow = () => {
    const { cellFocused, cellMap, cellOrder } = this.props;
    if (!cellFocused) {
      this.executeAllCells();
    } else {
      const cellIds = cellOrder
        .skip(cellOrder.indexOf(cellFocused))
        .filter(cellId => cellMap.getIn([cellId, "cell_type"]) === "code");
      this.executeCells(cellIds);
    }
  };
  executeAllCells = () => {
    const { cellMap, cellOrder } = this.props;
    const cellIds = cellOrder.filter(
      cellId => cellMap.getIn([cellId, "cell_type"]) === "code"
    );
    this.executeCells(cellIds);
  };

  handleClick = ({ key }: { key: string }) => {
    const [action, ...args] = parseActionKey(key);
    switch (action) {
      case ACTIONS.COPY_CELL:
        if (this.props.copyCell) {
          this.props.copyCell(this.props.cellFocused);
        }
        break;
      case ACTIONS.CUT_CELL:
        if (this.props.cutCell) {
          this.props.cutCell(this.props.cellFocused);
        }
        break;
      case ACTIONS.PASTE_CELL:
        if (this.props.pasteCell) {
          this.props.pasteCell();
        }
        break;
      case ACTIONS.CREATE_CODE_CELL:
        if (this.props.createCodeCell) {
          this.props.createCodeCell(this.props.cellFocused);
        }
        break;
      case ACTIONS.CREATE_MARKDOWN_CELL:
        if (this.props.createMarkdownCell) {
          this.props.createMarkdownCell(this.props.cellFocused);
        }
        break;
      case ACTIONS.SET_CELL_TYPE_CODE:
        if (this.props.setCellTypeCode) {
          this.props.setCellTypeCode(this.props.cellFocused);
        }
        break;
      case ACTIONS.SET_CELL_TYPE_MARKDOWN:
        if (this.props.setCellTypeMarkdown) {
          this.props.setCellTypeMarkdown(this.props.cellFocused);
        }
        break;
      case ACTIONS.EXECUTE_ALL_CELLS:
        this.executeAllCells();
        break;
      case ACTIONS.EXECUTE_ALL_CELLS_BELOW:
        this.executeAllCellsBelow();
        break;
      default:
        console.log(`unhandled action: ${action}`);
    }
  };
  render() {
    const { defaultOpenKeys } = this.props;
    return (
      <div>
        <Menu
          mode="horizontal"
          onClick={this.handleClick}
          defaultOpenKeys={defaultOpenKeys}
          selectable={false}
        >
          <SubMenu key={MENUS.EDIT} title="Edit">
            <MenuItem key={createActionKey(ACTIONS.CUT_CELL)}>
              Cut Cell
            </MenuItem>
            <MenuItem key={createActionKey(ACTIONS.COPY_CELL)}>
              Copy Cell
            </MenuItem>
            <MenuItem key={createActionKey(ACTIONS.PASTE_CELL)}>
              Paste Cell Below
            </MenuItem>
            <Divider />
            <SubMenu key={MENUS.EDIT_SET_CELL_TYPE} title="Cell Type">
              <MenuItem key={createActionKey(ACTIONS.SET_CELL_TYPE_CODE)}>
                Code
              </MenuItem>
              <MenuItem key={createActionKey(ACTIONS.SET_CELL_TYPE_MARKDOWN)}>
                Markdown
              </MenuItem>
            </SubMenu>
          </SubMenu>
          <SubMenu key={MENUS.CELL} title="Cell">
            <MenuItem key={createActionKey(ACTIONS.EXECUTE_ALL_CELLS)}>
              Run All Cells
            </MenuItem>
            <MenuItem key={createActionKey(ACTIONS.EXECUTE_ALL_CELLS_BELOW)}>
              Run All Cells Below
            </MenuItem>
            <Divider />
            <SubMenu key={MENUS.CELL_CREATE_CELL} title="New Cell">
              <MenuItem key={createActionKey(ACTIONS.CREATE_CODE_CELL)}>
                Code
              </MenuItem>
              <MenuItem key={createActionKey(ACTIONS.CREATE_MARKDOWN_CELL)}>
                Markdown
              </MenuItem>
            </SubMenu>
          </SubMenu>
        </Menu>
        <style global jsx>
          {localCss}
        </style>
        <style jsx>{`
          position: sticky;
          top: 0;
          // TODO: this is getting ridiculous...
          z-index: 10000;
        `}</style>
      </div>
    );
  }
}

// TODO: this forces the menu to re-render on cell focus. The better option is
// to alter how the actions work to just target the currently focused cell.
// That said, we *may* not have a great way of getting around this as we'll need
// information about the current document to decide which menu items are
// available...
const mapStateToProps = state => ({
  cellFocused: state.document.cellFocused,
  cellMap: state.document.getIn(["notebook", "cellMap"]),
  cellOrder: state.document.getIn(["notebook", "cellOrder"])
});

const mapDispatchToProps = dispatch => ({
  executeCell: cellId => dispatch(actions.executeCell(cellId)),
  cutCell: cellId => dispatch(actions.cutCell(cellId)),
  copyCell: cellId => dispatch(actions.copyCell(cellId)),
  pasteCell: () => dispatch(actions.pasteCell()),
  createCodeCell: cellId => dispatch(actions.createCellAfter("code", cellId)),
  createMarkdownCell: cellId =>
    dispatch(actions.createCellAfter("markdown", cellId)),
  setCellTypeCode: cellId => dispatch(actions.changeCellType(cellId, "code")),
  setCellTypeMarkdown: cellId =>
    dispatch(actions.changeCellType(cellId, "markdown"))
});

const NotebookMenu = connect(mapStateToProps, mapDispatchToProps)(
  PureNotebookMenu
);

// We export this for testing purposes.
export { PureNotebookMenu };

export default NotebookMenu;
