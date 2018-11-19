/* @flow */
import React from "react";

type Props = {
  data: string,
  mediaType: "text/javascript"
};

export function runCodeHere(el: ?HTMLElement, code: string): any {
  if (!el) return;
  // Compatibility with Jupyter/notebook JS evaluation.  Set element so
  // the user has a handle on the context of the current output.
  const element = el;
  try {
    return eval(code); // eslint-disable-line no-eval
  } catch (err) {
    const pre = document.createElement("pre");
    if (err.stack) {
      pre.textContent = err.stack;
    } else {
      pre.textContent = err;
    }
    element.appendChild(pre);
    return err;
  }
}

export default class JavaScript extends React.PureComponent<Props> {
  el: ?HTMLElement;

  static MIMETYPE = "application/javascript";

  static defaultProps = {
    data: "",
    mediaType: "application/javascript"
  };

  static handles(mimetype: string) {
    return (
      mimetype.startsWith("text/") ||
      mimetype.startsWith("application/javascript") ||
      mimetype.startsWith("application/json")
    );
  }

  componentDidMount(): void {
    runCodeHere(this.el, this.props.data);
  }

  componentDidUpdate(): void {
    runCodeHere(this.el, this.props.data);
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
