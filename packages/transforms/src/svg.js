/* @flow */
import React from "react";

type Props = {
  data: string
};

export default class SVGDisplay extends React.Component {
  props: Props;
  el: HTMLElement;
  static MIMETYPE = "image/svg+xml";

  componentDidMount(): void {
    this.el.insertAdjacentHTML("beforeend", this.props.data);
  }

  shouldComponentUpdate(nextProps: Props): boolean {
    return nextProps.data !== this.props.data;
  }

  componentDidUpdate(): void {
    // clear out all DOM element children
    while (this.el.firstChild) {
      this.el.removeChild(this.el.firstChild);
    }
    this.el.insertAdjacentHTML("beforeend", this.props.data);
  }

  render(): ?React.Element<any> {
    return (
      <div
        ref={el => {
          this.el = el;
        }}
      />
    );
  }
}
