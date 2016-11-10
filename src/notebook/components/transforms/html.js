/* @flow */
import React from 'react';
import ReactDOM from 'react-dom';

type Props = {
  data: string,
}

export default class HTMLDisplay extends React.Component {
  props: Props;
  el: HTMLElement;

  componentDidMount(): void {
    // Create a range to ensure that scripts are invoked from within the HTML
    if (document.createRange && Range && Range.prototype.createContextualFragment) {
      const range = document.createRange();
      const fragment = range.createContextualFragment(this.props.data);
      this.el.appendChild(fragment);
    } else {
      this.el.innerHTML = this.props.data;
    }
  }

  shouldComponentUpdate(): boolean {
    return true;
  }

  render(): ?React.Element<any> {
    return (
      <div ref={(el) => { this.el = el; }} />
    );
  }
}
