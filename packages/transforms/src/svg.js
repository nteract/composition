/* @flow */
import React from "react";

type Props = {
  data: string
};

export default class SVGDisplay extends React.Component<Props> {
  el: ?HTMLElement;
  static MIMETYPE = "image/svg+xml";

  constructor(props) {
    super(props);

    this.elRef = React.createRef();
  }

  componentDidMount(): void {
    if (this.elRef.current) {
      this.elRef.current.insertAdjacentHTML("beforeend", this.props.data);
    }
  }

  shouldComponentUpdate(nextProps: Props): boolean {
    return nextProps.data !== this.props.data;
  }

  componentDidUpdate(): void {
    if (!this.elRef.current) return;
    // clear out all DOM element children
    while (this.elRef.current.firstChild) {
      this.elRef.current.removeChild(this.elRef.current.firstChild);
    }
    this.elRef.current.insertAdjacentHTML("beforeend", this.props.data);
  }

  render(): ?React$Element<any> {
    return (
      <div
        ref={this.elRef}
      />
    );
  }
}
