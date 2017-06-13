/* @flow */
import React from "react";

const vm = require("vm");

const requirejs = require("requirejs");

type Props = {
  data: string
};

// In a complete about-face, we're going to support a variety of notebook
// extensions that are used within display data in Jupyter.
//
// Primary module support, since we already include them as part of our app:
//   * vega
//   * d3
//   * plotly
//   * underscore / lodash (we'll provide lodash)

function createSandbox(element: HTMLElement) {
  function pretendRequire(modules: Array<string> | string, cb?: Function) {
    if (typeof modules === "string") {
      // Assume CommonJS, though we'll only support specific modules
      // For now, only error
      const p = document.createElement("p");
      p.textContent = "nteract does not support commonJS loading of modules";
      element.appendChild(p);
      return;
    } else if (Array.isArray(modules)) {
      // AMD
      // cb is expecting to be called with the loaded modules

      // BEGIN THE HACKS!
      if (modules.length === 1 && typeof cb === "function") {
        switch (modules[0]) {
          case "nbextensions/jupyter-vega/index":
            const vega = require("./hacks/jupyter-vega").vega(element);
            cb(vega);
            return;
          case "d3":
            cb(require("d3"));
            return;
          default:
            const p = document.createElement("p");
            p.textContent = `nteract does not support "${modules[0]}" out of the box, raise an issue if you think you could help it become a reality`;
            element.appendChild(p);
            return;
        }
      }

      const p = document.createElement("p");
      p.textContent = `whatever you or the library you were using was trying to do with require is not supported in nteract`;
      element.appendChild(p);
    }
  }

  function pretendDefine(cb?: Function) {
    const p = document.createElement("p");
    p.textContent = `nteract does not support "define" in javascript outputs`;
    element.appendChild(p);
    return;
  }

  const sandbox = Object.assign(
    {},
    global,
    {
      // TODO: until this is inside a webview or iframe, this escape hatch
      // means we're **NOT** properly sandboxed
      element,
      require: pretendRequire,
      define: pretendDefine
    }
    // HACK: Give them global access anyways
  );

  return sandbox;
}

export function runCodeHere(el: HTMLElement, code: string): any {
  // Compatibility with Jupyter/notebook JS evaluation.  Set element so
  // the user has a handle on the context of the current output.
  const element = el;

  const sandbox = createSandbox(element);
  const ctxt = vm.createContext(sandbox);

  try {
    vm.runInContext(code, ctxt, {
      filename: "kernel-output",
      lineOffset: 0,
      timeout: 2000,
      displayErrors: false
    });
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

class JavaScriptDisplay extends React.Component {
  props: Props;
  el: HTMLElement;

  static MIMETYPE = "application/javascript";

  componentDidMount(): void {
    runCodeHere(this.el, this.props.data);
  }

  shouldComponentUpdate(nextProps: Props): boolean {
    return nextProps.data !== this.props.data;
  }

  componentDidUpdate(): void {
    runCodeHere(this.el, this.props.data);
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

export default JavaScriptDisplay;
