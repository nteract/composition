// @flow
import * as React from "react";
import { connect } from "react-redux";
import * as actions from "../../actions";
import handleKeyDownEvent, { COMMANDS } from "./handle-key-down-event";

type Props = {
  executeFocusedCell: () => void,
  focusNextCell: () => void,
  focusNextCellEditor: () => void,
  children: *
};

class PureKeyboardShortcuts extends React.Component<Props> {
  execute = (event: KeyboardEvent) => {
    // We're handing this. So don't let anyone else touch it (like an editor).
    event.preventDefault();
    const { executeFocusedCell } = this.props;
    executeFocusedCell();
  };
  executeAndStep = (event: KeyboardEvent) => {
    // We're handing this. So don't let anyone else touch it (like an editor).
    event.preventDefault();

    const {
      executeFocusedCell,
      focusNextCell,
      focusNextCellEditor
    } = this.props;

    // NOTE: Order matters. We need to execute _before_ we focus the next cell.
    executeFocusedCell();
    focusNextCell();
    focusNextCellEditor(); // TODO: Could focusNextCell do focusing of both?
  };
  handleKeyDown = (event: KeyboardEvent): void => {
    const handlers = {
      [COMMANDS.EXECUTE]: this.execute,
      [COMMANDS.EXECUTE_AND_STEP]: this.executeAndStep
    };
    handleKeyDownEvent(handlers, event);
  };
  componentDidMount(): void {
    document.addEventListener("keydown", this.handleKeyDown);
  }
  componentWillUnmount(): void {
    document.removeEventListener("keydown", this.handleKeyDown);
  }
  render() {
    return <React.Fragment>{this.props.children}</React.Fragment>;
  }
}

const mapDispatchToProps = {
  executeFocusedCell: actions.executeFocusedCell,
  focusNextCell: actions.focusNextCell,
  focusNextCellEditor: actions.focusNextCellEditor
};

export { PureKeyboardShortcuts };

export default connect(null, mapDispatchToProps)(PureKeyboardShortcuts);
