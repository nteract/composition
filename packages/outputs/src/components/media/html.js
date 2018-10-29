// @flow strict
import * as React from "react";

type Props = {
  /**
   * The HTML string that will be rendered.
   */
  data: string,
  /**
   * The media type associated with the HTML
   * string. This defaults to text/html.
   */
  mediaType: 'text/html'
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

export class HTML extends React.Component<Props> {
  static defaultProps = {
    mediaType: "text/html",
    data: null
  };
  elRef: React.ElementRef<*> = React.createRef();
  componentDidMount(): void {
    // clear out all DOM element children
    // This matters on server side render otherwise we'll get both the `innerHTML`ed
    // version + the fragment version right after each other
    // In the desktop app (and successive loads with tools like commuter) this
    // will be a no-op
    if (!this.elRef.current) return;
    while (this.elRef.current.firstChild) {
      this.elRef.current.removeChild(this.elRef.current.firstChild);
    }
    // DOM element appended with a real DOM Node fragment
    this.elRef.current.appendChild(createFragment(this.props.data));
  }

  shouldComponentUpdate(nextProps: Props): boolean {
    return nextProps.data !== this.props.data;
  }
  componentDidUpdate(): void {
    if (!this.elRef.current) return;
    // clear out all DOM element children
    while (this.elRef.current.firstChild) {
      this.elRef.current.removeChild(this.elRef.current.firstChild);
    }
    this.elRef.current.appendChild(createFragment(this.props.data));
  }

  render() {
    return (
      <div
        dangerouslySetInnerHTML={{ __html: this.props.data }}
        ref={this.elRef}
      />
    );
  }
}
