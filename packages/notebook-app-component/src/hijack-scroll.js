// @flow
/* eslint jsx-a11y/no-static-element-interactions: 0 */
/* eslint jsx-a11y/click-events-have-key-events: 0 */

import * as React from "react";

type HijackScrollProps = {
  focused: boolean,
  onClick: () => void,
  children: React.Node
};

export class HijackScroll extends React.Component<HijackScrollProps, *> {
  el: ?HTMLElement;

  scrollIntoViewIfNeeded(prevFocused?: boolean): void {
    // Check if the element is being hovered over.
    const hovered =
      this.el &&
      this.el.parentElement &&
      this.el.parentElement.querySelector(":hover") === this.el;

    if (
      this.props.focused &&
      prevFocused !== this.props.focused &&
      // Don't scroll into view if already hovered over, this prevents
      // accidentally selecting text within the codemirror area
      !hovered
    ) {
      if (this.el && "scrollIntoViewIfNeeded" in this.el) {
        // $FlowFixMe: This is only valid in Chrome, WebKit
        this.el.scrollIntoViewIfNeeded();
      } else {
        // TODO: Polyfill as best we can for the webapp version
      }
    }
  }

  componentDidUpdate(prevProps: HijackScrollProps) {
    this.scrollIntoViewIfNeeded(prevProps.focused);
  }

  componentDidMount(): void {
    this.scrollIntoViewIfNeeded();
  }

  render() {
    return (
      <div
        onClick={this.props.onClick}
        role="presentation"
        ref={el => {
          this.el = el;
        }}
      >
        {this.props.children}
      </div>
    );
  }
}
