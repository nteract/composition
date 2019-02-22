// tslint:disable:object-literal-sort-keys
/**
 * Declarative menu to replace the rc-menu backed menu
 */
import React from "react";
import ReactDOM from "react-dom";

import {
  Button,
  ButtonGroup,
  Menu,
  MenuDivider,
  MenuItem,
  Popover,
  Position,
  PopoverInteractionKind
} from "@blueprintjs/core";
import { actions, AppState, ContentRef } from "@nteract/core";
import { Dispatch } from "redux";
import { connect } from "react-redux";

type MenuEntry = () => void | { [item: string]: MenuEntry };

const popoverProps = {
  position: Position.BOTTOM_LEFT
  // minimal: true,
  // interactionKind: PopoverInteractionKind.HOVER,
  // autofocus: false
};

/**
 * Written to be a workaround for submenu bugs
 * xref: https://github.com/palantir/blueprint/issues/3352
 */
const submenuPopoverProps = Object.assign({}, popoverProps, {
  position: Position.RIGHT,
  autofocus: false
});

interface Props {
  // Since we create the mapDispatchToProps only once (? should verify this)
  // We can make a grab bag of actions nested by menu name
  // tslint:disable-next-line:react-pure-components-have-simple-attributes
  triggers: {
    // each submenu has its own actions to map with
    file: {
      open: () => void;
      save: () => void;
      download: () => void;
    };
    edit: {
      cutCell: () => void;
      copyCell: () => void;
      pasteCell: () => void;
      cellType: {
        markdown: () => void;
        code: () => void;
      };
    };
    view: {
      themes: {
        dark: () => void;
        light: () => void;
      };
    };
    cell: {
      runAll: () => void;
      runAllBelow: () => void;
      newCell: {
        markdown: () => void;
        code: () => void;
      };
      clearAllOutputs: () => void;
      unhideAllInputAndOutput: () => void;
    };
  };
}

export class PureNotebookMenu extends React.PureComponent<Props> {
  render() {
    return (
      <Menu className="bp3-button-group">
        <MenuItem text={"File"} popoverProps={popoverProps}>
          <MenuItem
            text="Open..."
            icon="folder-shared"
            onClick={this.props.triggers.file.open}
          />
          <MenuDivider />
          <MenuItem
            text="Save"
            icon="floppy-disk"
            onClick={this.props.triggers.file.save}
          />
          <MenuItem
            text="Download (.ipynb)"
            icon="cloud-download"
            onClick={this.props.triggers.file.download}
          />
        </MenuItem>
        <MenuItem text={"Edit"} popoverProps={popoverProps}>
          <MenuItem
            text="Cut Cell"
            icon="cut"
            onClick={this.props.triggers.edit.cutCell}
          />
          <MenuItem
            text="Copy Cell"
            icon="clipboard"
            onClick={this.props.triggers.edit.copyCell}
          />
          <MenuItem
            text="Paste Cell Below"
            icon="clipboard"
            onClick={this.props.triggers.edit.pasteCell}
          />
          <MenuDivider />
          <MenuItem
            text="Change Focused Cell to Code"
            icon="code"
            onClick={this.props.triggers.edit.cellType.code}
          />
          <MenuItem
            text="Change Focused Cell to Markdown"
            icon="new-text-box"
            onClick={this.props.triggers.edit.cellType.markdown}
          />
        </MenuItem>
        {/*
          Until we have implemented themes to match up with blueprint, we
          need to stick with only the light theme. As a result, we won't have a
          "View" menu.

          To implement dark mode for a blueprint app, specify `bp3-dark` as a
          className on the top most component.
        */}
        {/*
        <Popover {...popoverProps}>
          <Button text={"View"} />
          <Menu>
            <MenuItem
              text="Themes"
              icon="cog"
              popoverProps={submenuPopoverProps}
            >
              <MenuItem
                text="light"
                icon="flash"
                onClick={this.props.triggers.view.themes.light}
              />
              <MenuItem
                text="dark"
                icon="moon"
                onClick={this.props.triggers.view.themes.dark}
              />
            </MenuItem>
          </Menu>
        </Popover> */}
        <MenuItem text={"Insert"} popoverProps={popoverProps}>
          <MenuItem
            text="Code Cell"
            icon="code"
            onClick={this.props.triggers.cell.newCell.code}
          />
          <MenuItem
            text="Markdown Cell"
            icon="new-text-box"
            onClick={this.props.triggers.cell.newCell.markdown}
          />
        </MenuItem>
        <MenuItem text={"Runtime"} popoverProps={popoverProps} />
        <MenuItem text={"Help"} popoverProps={popoverProps} />
      </Menu>
    );
  }
}

function makeMapDispatchToProps(
  initialState: AppState,
  initialProps: { contentRef: ContentRef }
) {
  const { contentRef } = initialProps;

  const payload = { contentRef };

  function mapDispatchToProps(dispatch: Dispatch) {
    return {
      triggers: {
        // each submenu has its own actions to map with
        file: {
          open: () => {
            // Special case -- redirect to /tree
          },
          save: () => {
            dispatch(actions.save(payload));
          },
          download: () => {
            dispatch(actions.downloadContent(payload));
          }
        },
        edit: {
          cutCell: () => {
            dispatch(actions.cutCell(payload));
          },
          copyCell: () => {
            dispatch(actions.copyCell(payload));
          },
          pasteCell: () => {
            dispatch(actions.pasteCell(payload));
          },
          cellType: {
            markdown: () => {
              console.log("change to markdown");
              dispatch(actions.changeCellType({ to: "markdown", contentRef }));
            },
            code: () => {
              dispatch(actions.changeCellType({ to: "code", contentRef }));
            }
          }
        },
        view: {
          themes: {
            dark: () => {
              dispatch(actions.setTheme("dark"));
            },
            light: () => {
              dispatch(actions.setTheme("light"));
            }
          }
        },
        cell: {
          runAll: () => {
            dispatch(actions.executeAllCells(payload));
          },
          runAllBelow: () => {
            dispatch(actions.executeAllCellsBelow(payload));
          },
          newCell: {
            markdown: () => {
              dispatch(
                actions.createCellBelow({
                  contentRef,
                  cellType: "markdown",
                  source: ""
                })
              );
            },
            code: () => {
              dispatch(
                actions.createCellBelow({
                  contentRef,
                  cellType: "code",
                  source: ""
                })
              );
            }
          },
          clearAllOutputs: () => {
            dispatch(actions.clearAllOutputs(payload));
          },
          unhideAllInputAndOutput: () => {
            dispatch(
              actions.unhideAll({
                outputHidden: false,
                inputHidden: false,
                contentRef
              })
            );
          }
        }
      }
    };
  }

  return mapDispatchToProps;
}

export const NotebookMenu = connect(
  null,
  makeMapDispatchToProps
)(PureNotebookMenu);
