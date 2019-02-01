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
  Position
} from "@blueprintjs/core";
import { AppState, ContentRef } from "@nteract/core";
import { Dispatch } from "redux";
import { connect } from "react-redux";

interface Props {
  // Since we create the mapDispatchToProps only once (? should verify this)
  // We can make a grab bag of actions nested by menu name
  // tslint:disable-next-line:react-pure-components-have-simple-attributes
  triggers: {
    [menu: string]: {
      [onClick: string]: () => void;
    };
  };
}

export class PureNotebookMenu extends React.PureComponent<Props> {
  render() {
    return (
      <ButtonGroup minimal>
        <Popover position={Position.BOTTOM_LEFT} minimal usePortal>
          <Button text={"File"} minimal />
          <Menu>
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
          </Menu>
        </Popover>
        <Popover position={Position.BOTTOM_LEFT} minimal usePortal>
          <Button text={"Edit"} />
          <Menu>
            <MenuItem
              text="Cut Cell"
              icon="cut"
              onClick={this.props.triggers.edit.cut}
            />
          </Menu>
        </Popover>
      </ButtonGroup>
    );
  }
}

function makeMapDispatchToProps(
  initialState: AppState,
  initialProps: { contentRef: ContentRef }
) {
  const { contentRef } = initialProps;

  function mapDispatchToProps(dispatch: Dispatch) {
    return {
      triggers: {
        // each submenu has its own actions to map with
        file: {
          open: () => {
            console.log("clicky");
            dispatch({ type: "Clicky", payload: { contentRef } });
          }
        },
        edit: {
          cut: () => {
            console.log("cut me");
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
