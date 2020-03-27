import * as React from "react";
import styled from "styled-components";

import outputStyle from "../outputStyle";

interface Props {
  /**
   * The HTML string that will be rendered.
   */
  data: string;
  /**
   * The media type associated with the HTML
   * string. This defaults to text/html.
   */
  mediaType: "text/html";
}

// Note: createRange and Range must be polyfilled on older browsers with
//       https://github.com/timdown/rangy
function createFragment(html: string): Node {
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

const StyledDiv = styled.div`
  ${outputStyle}
`;

export class HTML extends React.PureComponent<Props> {
  static defaultProps = {
    data: "",
    mediaType: "text/html"
  };

  el?: HTMLElement | null;

  componentDidMount(): void {
    // clear out all DOM element children
    // This matters on server side render otherwise we'll get both the `innerHTML`ed
    // version + the fragment version right after each other
    // In the desktop app (and successive loads with tools like commuter) this
    // will be a no-op
    if (!this.el) {
      return;
    }
    while (this.el.firstChild) {
      this.el.removeChild(this.el.firstChild);
    }
    // DOM element appended with a real DOM Node fragment
    this.el.appendChild(createFragment(this.props.data));
  }

  componentDidUpdate(): void {
    if (!this.el) {
      return;
    }
    // clear out all DOM element children
    while (this.el.firstChild) {
      this.el.removeChild(this.el.firstChild);
    }
    this.el.appendChild(createFragment(this.props.data));
  }

  render() {
    return (
      <StyledDiv
        dangerouslySetInnerHTML={{ __html: this.props.data }}
        ref={el => {
          this.el = el;
        }}
      />
    );
  }
}

export default HTML;
