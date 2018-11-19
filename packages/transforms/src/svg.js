/* @flow */
import React from "react";

type Props = {
  data: string,
  mediaType: "image/svg+xml"
};

export default class SVGDisplay extends React.PureComponent<Props> {
  el: ?HTMLElement;

  static MIMETYPE = "image/svg+xml";

  static defaultProps = {
    data: "",
    mediaType: "image/svg+xml"
  };

  componentDidMount(): void {
    if (this.el) {
      this.el.insertAdjacentHTML("beforeend", this.props.data);
    }
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
