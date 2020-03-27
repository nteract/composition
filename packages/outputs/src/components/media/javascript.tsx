import React from "react";

interface Props {
  /**
   * The JavaScript code that we would like to execute.
   */
  data: string;
  /**
   * The media type associated with our component.
   */
  mediaType: "text/javascript";
}

export function runCodeHere(el: HTMLElement | null, code: string): any {
  if (!el) {
    return;
  }
  // Compatibility with Jupyter/notebook JS evaluation.  Set element so
  // the user has a handle on the context of the current output.
  const element = el;
  try {
    // tslint:disable-next-line:no-eval
    return eval(code);
  } catch (err) {
    const pre = document.createElement("pre");
    pre.style.whiteSpace = "pre-wrap";
    if (err.stack) {
      pre.textContent = err.stack;
    } else {
      pre.textContent = err;
    }
    element.appendChild(pre);
    return err;
  }
}

export class JavaScript extends React.PureComponent<Props> {
  static defaultProps = {
    data: "",
    mediaType: "application/javascript"
  };

  el!: HTMLElement | null;

  componentDidMount(): void {
    runCodeHere(this.el, this.props.data);
  }

  componentDidUpdate(): void {
    runCodeHere(this.el, this.props.data);
  }

  render() {
    return (
      <div
        ref={el => {
          this.el = el;
        }}
      />
    );
  }
}

export default JavaScript;
