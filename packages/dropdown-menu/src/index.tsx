/* eslint jsx-a11y/no-static-element-interactions: 0 */
/* eslint jsx-a11y/click-events-have-key-events: 0 */

// react-hot-loader uses proxies to the original elements so we need to use
// their comparison function in case a consumer of these components is
// using hot module reloading
import * as React from "react";
import { areComponentsEqual } from "react-hot-loader";
import styled from "styled-components";

interface DropdownMenuProps {
  children: React.ReactNode;
}

interface DropdownMenuState {
  menuHidden: boolean;
}

const DropdownDiv = styled.div`
  z-index: 10000;
  display: inline-block;
`;

DropdownDiv.displayName = "DropdownDiv";

export class DropdownMenu extends React.PureComponent<
  DropdownMenuProps,
  DropdownMenuState
> {
  listRef = React.createRef<HTMLUListElement>();

  constructor(props: DropdownMenuProps) {
    super(props);
    this.state = {
      menuHidden: true
    };
  }
  handleKeyUp = (ev: React.KeyboardEvent<HTMLElement>) => {
    if (!this.state.menuHidden) {
      if (ev.key === "Escape") {
        this.setState({ menuHidden: true });
      } else if (ev.key === "ArrowDown") {
        this.moveListChildFocus(1);
      } else if (ev.key === "ArrowUp") {
        this.moveListChildFocus(-1);
      }
    }
  };
  /***
   * Looks at the children of the ul, finds the focused child, and moves the focus the specified amount
   */
  moveListChildFocus(amount: number) {
    let ulEl = this.listRef.current;
    if (ulEl) {
      let activeIndex;
      for (let i = 0; i < ulEl.children.length; i++) {
        let li = ulEl.children[i];
        if (li == document.activeElement) {
          activeIndex = i;
          break;
        }
      }
      let nextActiveIndex =
        activeIndex === undefined
          ? 0
          : (activeIndex + amount) % ulEl.children.length;
      // Because JS mod can produce negative numbers, we need a negative check also
      nextActiveIndex =
        nextActiveIndex < 0
          ? ulEl.children.length + nextActiveIndex
          : nextActiveIndex;
      let nextItem = ulEl.children[nextActiveIndex] as HTMLElement;
      nextItem.focus();
    }
  }
  render() {
    return (
      <DropdownDiv onKeyUp={this.handleKeyUp}>
        {React.Children.map(this.props.children, child => {
          const childElement = child as React.ReactElement<any>;
          if (
            areComponentsEqual(
              childElement.type as React.ComponentType<any>,
              DropdownTrigger
            )
          ) {
            return React.cloneElement(childElement, {
              onClick: () => {
                this.setState({ menuHidden: !this.state.menuHidden });
              }
            });
          } else if (
            areComponentsEqual(
              childElement.type as React.ComponentType<any>,
              DropdownContent
            )
          ) {
            if (this.state.menuHidden) {
              return null;
            } else {
              // DropdownContent child will pass down an onItemClick so that
              // the menu will collapse
              return React.cloneElement(childElement, {
                onItemClick: () => {
                  this.setState({ menuHidden: true });
                },
                ulRef: this.listRef
              });
            }
          } else {
            // fallback
            return child;
          }
        })}
      </DropdownDiv>
    );
  }
}

const DropdownTriggerDiv = styled.div`
  user-select: none;
  margin: 0px;
  padding: 0px;
`;

DropdownTriggerDiv.displayName = "DropdownTriggerDiv";

// tslint:disable max-classes-per-file
export class DropdownTrigger extends React.PureComponent<{
  children: React.ReactNode;
  onClick?: (ev: React.MouseEvent<HTMLElement>) => void;
}> {
  render() {
    return (
      <DropdownTriggerDiv onClick={this.props.onClick}>
        {this.props.children}
      </DropdownTriggerDiv>
    );
  }
}

const DropdownContentDiv = styled.div`
  user-select: none;
  margin: 0px;
  padding: 0px;

  width: 200px;

  opacity: 1;
  position: absolute;
  top: 0.2em;
  right: 0;
  border-style: none;
  padding: 0;
  font-family: var(--nt-font-family-normal);
  font-size: var(--nt-font-size-m);
  line-height: 1.5;
  margin: 20px 0;
  background-color: var(--theme-cell-menu-bg);

  ul {
    list-style: none;
    text-align: left;
    padding: 0;
    margin: 0;
    opacity: 1;
  }

  ul li {
    padding: 0.5rem;
  }

  ul li:hover {
    background-color: var(--theme-cell-menu-bg-hover, #e2dfe3);
    cursor: pointer;
  }
`;

DropdownContentDiv.displayName = "DropdownContentDiv";

export class DropdownContent extends React.PureComponent<{
  children: React.ReactNode;
  onItemClick: (ev: React.MouseEvent<HTMLElement>) => void;
  ulRef?: React.RefObject<HTMLUListElement>;
}> {
  static defaultProps = {
    // Completely silly standalone, because DropdownMenu injects the onItemClick handler
    onItemClick: () => {}
  };

  render() {
    return (
      <DropdownContentDiv>
        <ul role="listbox" aria-label="dropdown-content" ref={this.props.ulRef}>
          {React.Children.map(this.props.children, child => {
            const childElement = child as React.ReactElement<any>;
            const elRef: React.RefObject<HTMLElement> = React.createRef();
            return React.cloneElement(childElement, {
              onClick: (ev: React.MouseEvent<HTMLElement>) => {
                childElement.props.onClick(ev);
                // Hide the menu
                this.props.onItemClick(ev);
              },
              onKeyUp: (ev: React.KeyboardEvent<HTMLElement>) => {
                if (childElement.props.onKeyUp) {
                  childElement.props.onKeyUp(ev); //forward the event
                }
                if (ev.key === "Enter" && elRef.current) {
                  (elRef.current as HTMLElement).click();
                }
              },
              ref: elRef
            });
          })}
        </ul>
      </DropdownContentDiv>
    );
  }
}
