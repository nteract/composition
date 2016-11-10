/* @flow */
import React from 'react';
import ReactDOM from 'react-dom';

type Props = {
  data: string,
}

function replaceHTML(el, html) {
  // Create a range to ensure that scripts are invoked from within the HTML
  if (document.createRange && Range && Range.prototype.createContextualFragment) {
    const range = document.createRange();
    const fragment = range.createContextualFragment(html);
    el.appendChild(fragment);
  } else {
    el.innerHTML = html;
  }
}

export default class HTMLDisplay extends React.Component {
  props: Props;
  el: HTMLElement;

  componentDidMount(): void {
    replaceHTML(this.el, this.props.data);
  }

  shouldComponentUpdate(old): boolean {
    return true;
  }
  componentDidUpdate(prevProps: Props): void {
    // clear out all DOM element children
    while (this.el.firstChild) {
      this.el.removeChild(this.el.firstChild);
    }
    replaceHTML(this.el, this.props.data);
  }

  render(): ?React.Element<any> {
    return (
      <div ref={(el) => { this.el = el; }} />
    );
  }
}
