/* @flow */
import React from 'react';
import mathjaxHelper from 'mathjax-electron';

type Props = {
  data: string,
};

export default class LaTeXDisplay extends React.Component {
  props: Props;
  el: HTMLElement;

  componentDidMount(): void {
    this.el.innerHTML = this.props.data;
    mathjaxHelper.loadAndTypeset(document, this.el);
  }

  shouldComponentUpdate(nextProps: Props): boolean {
    return this.props.data !== nextProps.data;
  }

  componentDidUpdate() {
    this.el.innerHTML = this.props.data;
    mathjaxHelper.loadAndTypeset(document, this.el);
  }

  render(): ?React.Element<any> {
    return (
      <div ref={(el) => { this.el = el; }} />
    );
  }
}
