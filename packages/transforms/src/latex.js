/* @flow */
import React from "react";
import mathjaxHelper from "mathjax-electron";

type Props = {
  data: string
};

export class DumbWrapper extends React.Component<Props> {
  componentDidCatch(error, info) {
    return (
      <div>
        <pre
          style={{
            backgroundColor: "ghostwhite",
            color: "black",
            fontWeight: "600",
            display: "block",
            padding: "10px",
            marginBottom: "20px"
          }}
        >
          There was an error rendering LaTeX data from the kernel or notebook
        </pre>
        <code>{error.toString()}</code>
      </div>
    );
  }

  render(): ?React$Element<any> {
    try {
      return <div>{this.props.children}</div>;
    } catch (err) {
      return componentDidCatch(err, "");
    }
  }
}

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
    // throw new Error("anything");
    return (
      <DumbWrapper>
        <div
          ref={el => {
            throw new Error("anything");
            this.el = el;
          }}
        />
      </DumbWrapper>
    );
  }
}
