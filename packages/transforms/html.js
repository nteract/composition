/* @flow */
import React from 'react';

type Props = {
  data: string,
}

// Note: createRange and Range must be polyfilled on older browsers with
//       https://github.com/timdown/rangy
export function createFragment(html: string): Node {
  // Create a range to ensure that scripts are invoked from within the HTML
  const range = document.createRange();
  const fragment = range.createContextualFragment(html);
  return fragment;
}

export default class HTMLDisplay extends React.Component {
  props: Props;
  el: HTMLElement;

  componentDidMount(): void {
    this.el.appendChild(createFragment(this.props.data));
  }

  shouldComponentUpdate(nextProps: Props): boolean {
    return nextProps.data !== this.props.data;
  }
  componentDidUpdate(): void {
    // clear out all DOM element children
    while (this.el.firstChild) {
      this.el.removeChild(this.el.firstChild);
    }
    this.el.appendChild(createFragment(this.props.data));
  }

  render(): ?React.Element<any> {
    return (
      <div ref={(el) => { this.el = el; }} />
    );
  }
}
