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
  elRef: React.ElementRef<*> = React.createRef();

  scrollIntoViewIfNeeded(prevFocused?: boolean): void {
    // Check if the element is being hovered over.
    const hovered =
      this.elRef.current &&
      this.elRef.current.parentElement &&
      this.elRef.current.parentElement.querySelector(":hover") === this.elRef.current;

    if (
      this.props.focused &&
      prevFocused !== this.props.focused &&
      // Don't scroll into view if already hovered over, this prevents
      // accidentally selecting text within the codemirror area
      !hovered
    ) {
      if (this.elRef.current && "scrollIntoViewIfNeeded" in this.elRef.current) {
        // $FlowFixMe: This is only valid in Chrome, WebKit
        this.elRef.current.scrollIntoViewIfNeeded();
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
        ref={this.elRef}
      >
        {this.props.children}
      </div>
    );
  }
}
