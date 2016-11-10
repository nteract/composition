/* @flow */
import React from 'react';
import ReactDOM from 'react-dom';

type Props = {
  data: string,
}

function createElement(html: string): Node {
  // Create a range to ensure that scripts are invoked from within the HTML
  if (document.createRange && Range && Range.prototype.createContextualFragment) {
    const range = document.createRange();
    const fragment = range.createContextualFragment(html);
    return fragment;
  }
  const d = document.createElement('div');
  d.innerHTML = html;
  return d;
}

export default class HTMLDisplay extends React.Component {
  props: Props;
  el: HTMLElement;

  componentDidMount(): void {
    this.el.appendChild(createElement(this.props.data));
  }

  shouldComponentUpdate(prevProps: Props): boolean {
    return prevProps.data !== this.props.data;
  }
  componentDidUpdate(prevProps: Props): void {
    // clear out all DOM element children
    while (this.el.firstChild) {
      this.el.removeChild(this.el.firstChild);
    }
    this.el.appendChild(createElement(this.props.data));
  }

  render(): ?React.Element<any> {
    return (
      <div ref={(el) => { this.el = el; }} />
    );
  }
}
