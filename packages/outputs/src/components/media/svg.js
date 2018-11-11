/* @flow */
import React from "react";

type Props = {
  mediaType: string,
  data: string
};

export class SVG extends React.Component<Props> {
  el: ?HTMLElement;
  static defaultProps = {
    mediaType: "image/svg+xml",
    data: ""
  };

  componentDidMount(): void {
    if (this.el) {
      this.el.insertAdjacentHTML("beforeend", this.props.data);
    }
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
    this.el.insertAdjacentHTML("beforeend", this.props.data);
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
