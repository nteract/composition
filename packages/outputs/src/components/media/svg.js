/* @flow */
import * as React from "react";

type Props = {
  mediaType: string,
  data: string
};

export class SVG extends React.Component<Props> {
  elRef: React.ElementRef<*> = React.createRef();
  static defaultProps = {
    mediaType: "image/svg+xml",
    data: ""
  };
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
