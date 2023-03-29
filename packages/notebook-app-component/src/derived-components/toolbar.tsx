/* eslint jsx-a11y/no-static-element-interactions: 0 */
/* eslint jsx-a11y/click-events-have-key-events: 0 */
/* eslint jsx-a11y/anchor-is-valid: 0 */

import {
  DropdownContent,
  DropdownMenu,
  DropdownTrigger,
} from "@nteract/dropdown-menu";
import { LanguageSelector } from "@nteract/mythic-notebook";

import { ContentRef } from "@nteract/types";
import * as React from "react";

import { Icons } from "@nteract/presentational-components";
import { ToggleSwitch } from "@nteract/presentational-components";

import styled from "styled-components";

import {
  CellMenu,
  CellMenuItem,
  CellMenuSection,
  CircularButton,
} from "@nteract/presentational-components";
import { CellToolbar, CellToolbarContext } from "@nteract/stateful-components";
import { ExecutionCount } from "../../../commutable/lib";

const StyledDropdownContent = styled(DropdownContent)``;

export interface ComponentProps {
  contentRef: ContentRef;
  id: string;
}

interface ComponentState {
  moreActionsMenuExpanded: boolean;
  checkInput: boolean;
  checkOutput: boolean;
  checkExtendedOutput: boolean;
  checkParameterizedCell: boolean;
  showExecuteButton: boolean;
}

export default class Toolbar extends React.PureComponent<
  ComponentProps,
  ComponentState
> {
  static contextType = CellToolbarContext;
  toggleMenuRef: any = null;
  dropdownRef: any = null;

  constructor(props: ComponentProps) {
    super(props);
    this.state = {
      moreActionsMenuExpanded: false,
      checkInput: true,
      checkOutput: true,
      checkExtendedOutput: false,
      checkParameterizedCell: false,
      showExecuteButton: false,
    };

    this.toggleMenuRef = React.createRef();
    this.dropdownRef = React.createRef();
  }

  componentDidMount() {
    window.addEventListener("mousedown", this.handleClick);
  }

  componentWillUnmount() {
    window.removeEventListener("mousedown", this.handleClick);
  }

  handleClick = (e: MouseEvent) => {
    if (this.dropdownRef && this.dropdownRef.current.contains(e.target)) {
      return;
    }

    this.closeDropdown();
  };

  performActionAndClose = (action: () => void) => () => {
    action();

    this.closeDropdown();
  };

  closeDropdown = () => {
    if (this.state.moreActionsMenuExpanded) {
      this.toggleMenuRef.current.click();
    }
  };

  onDelete = (context: any) => {
    context.markCellAsDeleting();

    this.closeDropdown();
  };

  onInsertCodeCellBelow = (context: any) => {
    context.insertCodeCellBelow();

    this.closeDropdown();
  };

  onDisplayChanged = (expanded: boolean) => {
    this.setState({ moreActionsMenuExpanded: expanded });
  };

  toggleInput = (context: any) => {
    context.toggleCellInputVisibility();

    this.setState(
      (previous) => ({
        checkInput: !previous.checkInput,
      }),
      this.closeDropdown
    );
  };

  toggleOutput = (context: any) => {
    context.toggleCellOutputVisibility();

    this.setState(
      (previous) => ({
        checkOutput: !previous.checkOutput,
      }),
      this.closeDropdown
    );
  };

  toggleExtendedOutput = (context: any) => {
    context.toggleOutputExpansion();

    this.setState(
      (previous) => ({
        checkExtendedOutput: !previous.checkExtendedOutput,
      }),
      this.closeDropdown
    );
  };

  toggleParameterizedCell = (context: any) => {
    context.toggleParameterCell();

    this.setState(
      (previous) => ({
        checkParameterizedCell: !previous.checkParameterizedCell,
      }),
      this.closeDropdown
    );
  };

  showExecuteButton = () => {
    this.setState({ showExecuteButton: true });
  }

  hideExecuteButton = (executionCount: ExecutionCount) => {
    this.setState({ showExecuteButton: executionCount !== null ? false : true });
  }

  render(): JSX.Element {
    return (
      <CellToolbar contentRef={this.props.contentRef} id={this.props.id}>
        <CellToolbarContext.Consumer>
          {(context: any) => (
            <React.Fragment>
              {context.type !== "markdown" ? (
                <CircularButton
                  onClick={context.executeCell}
                  title="Execute this cell"
                  className="executeButton"
                  onMouseEnter={this.showExecuteButton}
                  onMouseLeave={() => this.hideExecuteButton(context.executionCount)}
                >
                  {context.executionCount == null ? <Icons.Play/> : (this.state.showExecuteButton ? <Icons.Play/> : context.executionCount)}
                </CircularButton>
              ) : null}
              <div ref={this.dropdownRef}>
                <DropdownMenu onDisplayChanged={this.onDisplayChanged}>
                  <DropdownTrigger>
                    <CircularButton
                      title="show additional actions"
                      aria-expanded={this.state.moreActionsMenuExpanded}
                      buttonRef={this.toggleMenuRef}
                    >
                      <Icons.More />
                    </CircularButton>
                  </DropdownTrigger>
                  {context.type === "code" ? (
                    <StyledDropdownContent
                      as={CellMenu}
                      visible={this.state.moreActionsMenuExpanded}
                    >
                      <CellMenuSection>
                        <CellMenuItem
                          onClick={this.performActionAndClose(
                            context.clearOutputs
                          )}
                          className="clearOutput"
                          tabIndex={0}
                        >
                          <Icons.Clear />
                          <a>Clear Cell Output</a>
                        </CellMenuItem>
                        <CellMenuItem
                          onClick={this.performActionAndClose(
                            context.changeToMarkdownCell
                          )}
                          className="changeType"
                          tabIndex={0}
                        >
                          <Icons.Markdown />
                          <a>Convert to Markdown Cell</a>
                        </CellMenuItem>
                        <CellMenuItem
                          onClick={this.performActionAndClose(
                            context.markCellAsDeleting
                          )}
                          tabIndex={0}
                        >
                          <Icons.Delete />
                          <a>Delete Cell</a>
                        </CellMenuItem>
                      </CellMenuSection>
                      <CellMenuSection>
                        <CellMenuItem
                          onClick={this.performActionAndClose(
                            context.insertCodeCellAbove
                          )}
                          tabIndex={0}
                        >
                          <Icons.AddCell below={false} />
                          <a>Add Cell Above</a>
                        </CellMenuItem>
                        <CellMenuItem
                          onClick={this.performActionAndClose(
                            context.insertCodeCellBelow
                          )}
                          tabIndex={0}
                        >
                          <Icons.AddCell below />
                          <a>Add Cell Below</a>
                        </CellMenuItem>
                      </CellMenuSection>
                      <CellMenuSection>
                        <CellMenuItem className="heading">
                          Visibility
                        </CellMenuItem>
                        <CellMenuItem tabIndex={0} focusWithin>
                          <ToggleSwitch
                            label="Input"
                            labelPlacement="start"
                            checked={this.state.checkInput}
                            onChange={() => {
                              this.toggleInput(context);
                            }}
                            className="cell-menu-item-toggle"
                          />
                        </CellMenuItem>
                        <CellMenuItem tabIndex={0} focusWithin>
                          <ToggleSwitch
                            label="Output"
                            labelPlacement="start"
                            checked={this.state.checkOutput}
                            onChange={() => {
                              this.toggleOutput(context);
                            }}
                            className="cell-menu-item-toggle"
                          />
                        </CellMenuItem>
                        <CellMenuItem tabIndex={0} focusWithin>
                          <ToggleSwitch
                            label="Extended Output"
                            labelPlacement="start"
                            checked={this.state.checkExtendedOutput}
                            onChange={() => {
                              this.toggleExtendedOutput(context);
                            }}
                            className="cell-menu-item-toggle"
                          />
                        </CellMenuItem>
                      </CellMenuSection>
                      <CellMenuSection>
                        <CellMenuItem tabIndex={0}>
                          <ToggleSwitch
                            label="Parameterized Cell"
                            labelPlacement="start"
                            checked={this.state.checkParameterizedCell}
                            onChange={() => {
                              this.toggleParameterizedCell(context);
                            }}
                            className="cell-menu-item-toggle"
                          />
                        </CellMenuItem>
                      </CellMenuSection>
                      <CellMenuSection>
                        <CellMenuItem className="heading">
                          Language
                        </CellMenuItem>
                        <CellMenuItem tabIndex={0} focusWithin>
                          <LanguageSelector cellAddress={{id: this.props.id, contentRef: this.props.contentRef}} />
                        </CellMenuItem>
                      </CellMenuSection>
                    </StyledDropdownContent>
                  ) : (
                    <StyledDropdownContent
                      as={CellMenu}
                      visible={this.state.moreActionsMenuExpanded}
                    >
                      <CellMenuSection>
                        <CellMenuItem
                          onClick={this.performActionAndClose(
                            context.changeToCodeCell
                          )}
                          className="changeType"
                          tabIndex={0}
                        >
                          <a>Convert to Code Cell</a>
                        </CellMenuItem>
                        <CellMenuItem
                          onClick={this.performActionAndClose(
                            context.markCellAsDeleting
                          )}
                          tabIndex={0}
                        >
                          <Icons.Delete />
                          <a>Delete Cell</a>
                        </CellMenuItem>
                      </CellMenuSection>
                      <CellMenuSection>
                        <CellMenuItem
                          onClick={this.performActionAndClose(
                            context.insertCodeCellAbove
                          )}
                          tabIndex={0}
                        >
                          <Icons.AddCell below={false} />
                          <a>Add Cell Above</a>
                        </CellMenuItem>
                        <CellMenuItem
                          onClick={this.performActionAndClose(
                            context.insertCodeCellBelow
                          )}
                          tabIndex={0}
                        >
                          <Icons.AddCell below />
                          <a>Add Cell Below</a>
                        </CellMenuItem>
                      </CellMenuSection>
                    </StyledDropdownContent>
                  )}
                </DropdownMenu>
              </div>
              <span className="spacer" />
            </React.Fragment>
          )}
        </CellToolbarContext.Consumer>
      </CellToolbar>
    );
  }
}
