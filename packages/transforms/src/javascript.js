/* @flow */
import React from "react";

type Props = {
  data: string
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

export default class JavaScript extends React.Component<Props> {
  el: ?HTMLElement;
  static MIMETYPE = "application/javascript";

  static handles(mimetype: string) {
    return (
      mimetype.startsWith("text/") ||
      mimetype.startsWith("application/javascript") ||
      mimetype.startsWith("application/json")
    );
  }

  constructor(props) {
    super(props);

    this.elRef = React.createRef();
  }

  componentDidMount(): void {
    runCodeHere(this.elRef.current, this.props.data);
  }

  shouldComponentUpdate(nextProps: Props): boolean {
    return nextProps.data !== this.props.data;
  }

  componentDidUpdate(): void {
    runCodeHere(this.elRef.current, this.props.data);
  }

  render(): ?React$Element<any> {
    return (
      <div
        ref={this.elRef}
      />
    );
  }
}
