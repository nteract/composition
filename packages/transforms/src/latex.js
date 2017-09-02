/* @flow */
import React from "react";
import mathjaxHelper from "mathjax-electron";

type Props = {
  data: string
};

export default class LaTeXDisplay extends React.Component<Props> {
  el: ?HTMLElement;
  static MIMETYPE = "text/latex";

  componentDidMount(): void {
    if (!this.el) return;
    this.el.innerHTML = this.props.data;
    mathjaxHelper.loadAndTypeset(document, this.el);
  }

  shouldComponentUpdate(nextProps: Props): boolean {
    return this.props.data !== nextProps.data;
  }

  componentDidUpdate() {
    if (!this.el) return;
    this.el.innerHTML = this.props.data;
    mathjaxHelper.loadAndTypeset(document, this.el);
  }

  render(): ?React$Element<any> {
    return (
      <div
        ref={el => {
          this.el = el;
        }}
      />
    );
  }
}
