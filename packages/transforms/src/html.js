/* @flow */
import React from "react";

type Props = {
  data: string
};

// Note: createRange and Range must be polyfilled on older browsers with
//       https://github.com/timdown/rangy
export function createFragment(html: string): Node {
  /**
   * createFragment takes in an HTML string and outputs a DOM element that is
   * treated as if it originated on the page "like normal".
   * @type {Node} - https://developer.mozilla.org/en-US/docs/Web/API/Node
   */
  // Create a range to ensure that scripts are invoked from within the HTML
  const range = document.createRange();
  const fragment = range.createContextualFragment(html);
  return fragment;
}

export default class HTMLDisplay extends React.Component<Props> {
  el: ?HTMLElement;
  static MIMETYPE = "text/html";

  componentDidMount(): void {
    // clear out all DOM element children
    // This matters on server side render otherwise we'll get both the `innerHTML`ed
    // version + the fragment version right after each other
    // In the desktop app (and successive loads with tools like commuter) this
    // will be a no-op
    if (!this.el) return;
    while (this.el.firstChild) {
      this.el.removeChild(this.el.firstChild);
    }
    // DOM element appended with a real DOM Node fragment
    this.el.appendChild(createFragment(this.props.data));
  }

  shouldComponentUpdate(nextProps: Props): boolean {
    return nextProps.data !== this.props.data;
  }
  componentDidUpdate(): void {
    if (!this.el) return;
    // clear out all DOM element children
    while (this.el.firstChild) {
      this.el.removeChild(this.el.firstChild);
    }
    this.el.appendChild(createFragment(this.props.data));
  }

  render(): ?React$Element<any> {
    return (
      <div
        dangerouslySetInnerHTML={{ __html: this.props.data }}
        ref={el => {
          this.el = el;
        }}
      />
    );
  }
}
