// FIXME: To make it easier to iterate on supported apps, flow is disabled for
// this file

import * as React from "react";
import { Router } from "../routes";

type InputState = {
  gistid: string
};

type InputProps = {};

class Input extends React.Component<InputProps, InputState> {
  constructor(props: InputProps) {
    super(props);
    this.state = { gistid: "" };
  }

  handleChange = (e: SyntheticEvent<HTMLInputElement>) => {
    this.setState({ gistid: e.currentTarget.value });
  };

  handleKeydown = (e: SyntheticEvent<HTMLInputElement>) => {
    // This got affected by a flow upgrade, there might be a better way of
    // handling submit with an <input /> element
    // $FlowFixMe figure out what this should be...
    if (e.key == "Enter") {
      this.handleConfirm();
    }
  };

  handleConfirm = (e?: SyntheticEvent<HTMLButtonElement>) => {
    if (this.state.gistid) {
      Router.pushRoute("edit", { gistid: this.state.gistid });
    }
  };

  render() {
    return (
      <React.Fragment>
        <div className="centering">
          <input
            placeholder="Gist ID"
            value={this.state.gistid}
            onChange={this.handleChange}
            onKeyDown={this.handleKeydown}
          />
          <button onClick={this.handleConfirm}>Launch Notebook</button>
        </div>
        <style jsx>{`
          .centering {
            position: absolute;
            display: flex;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 20px;
            font-family: Source Sans Pro, Helvetica, sans-serif;
          }
          button {
            margin-left: 0.5em;
            padding: 0.5em;
            border: none;
            outline: none;
            border: solid 1px black;
            background-color: black;
            color: white;
            font-size: inherit;
            white-space: nowrap;
          }

          button:hover {
            background-color: rgba(0, 0, 0, 0.75);
            border-color: rgba(0, 0, 0, 0.75);
          }

          input {
            width: 25em;
            padding: 0.5em;
            border: solid 1px black;
            font-size: inherit;
          }

          input:focus {
            outline: none;
          }
        `}</style>
      </React.Fragment>
    );
  }
}

export default Input;
