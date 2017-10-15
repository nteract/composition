import React from "react";

import { Display } from "@nteract/display-area";

// CSS and usage of this editor are not fun at the moment
// switching to just a textarea for now

// import Editor from "@nteract/editor";

const Left = () => {
  return <div>left</div>;
};

const Right = () => {
  return <div>right</div>;
};

import { light, dark } from "../styles";

const themes = {
  light,
  dark
};

const defaultCode = JSON.stringify(
  [
    {
      output_type: "display_data",
      data: {
        "application/vdom.v1+json": {
          tagName: "div",
          children: [
            {
              tagName: "h1",
              children: "It works!",
              attributes: {}
            }
          ],
          attributes: {}
        },
        "text/html": "<b>Woo</b>"
      },
      metadata: {}
    }
  ],
  null,
  2
);

const defaultOutputs = JSON.parse(defaultCode);

class MainApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      theme: "light",
      code: defaultCode,
      outputs: defaultOutputs
    };

    this.onEditorChange = this.onEditorChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onEditorKeyDown = this.onEditorKeyDown.bind(this);
    this.toggleTheme = this.toggleTheme.bind(this);
  }

  onEditorChange(event) {
    this.setState({ code: event.target.value }, this.onSubmit);
  }

  onSubmit() {
    try {
      const outputs = JSON.parse(this.state.code);
      this.setState({ outputs });
    } catch (err) {
      console.log(err);
      this.setState({
        outputs: [
          {
            output_type: "error",
            ename: "Error",
            evalue: err.message
            // traceback: [err.stack]
          }
        ]
      });
    }
  }

  onEditorKeyDown(event) {
    if (event.key === "Tab") {
      const start = event.target.selectionStart;
      const end = event.target.selectionEnd;

      const value =
        event.target.value.slice(0, start) +
        "  " +
        event.target.value.slice(end, event.target.value.length);

      const fakeEvent = {
        target: {
          value
        }
      };
      this.onEditorChange(fakeEvent);
      event.preventDefault();
      return false;
    }
  }

  toggleTheme() {
    console.log("theme change ? ");
    const theme = this.state.theme === "light" ? "dark" : "light";
    console.log("theme change ? ", theme);
    this.setState({ theme });

    console.log(themes[this.state.theme]);
  }

  componentDidCatch(err) {
    // TODO: Keep the last known good state for this demoware
    this.setState({
      code: defaultCode,
      outputs: defaultOutputs
    });
  }

  render() {
    return (
      <div>
        <div className="container">
          <header onClick={this.toggleTheme}>Let's Play</header>
          <div className="play-area">
            <div className="input">
              <textarea
                onChange={this.onEditorChange}
                value={this.state.code}
                onKeyDown={this.onEditorKeyDown}
              />
            </div>
            <div className="outputs">
              <Display theme={this.state.theme} outputs={this.state.outputs} />
            </div>
          </div>
        </div>

        <style global jsx>
          {themes[this.state.theme]}
        </style>

        <style global jsx>{`
          body {
            margin: 0;
            font-family: Nunito, sans-serif;
            background-color: var(--main-bg-color);
            color: var(--main-fg-color);
          }
        `}</style>
        <style jsx>{`
          header {
            background-color: var(--main-bg-color);
            border-bottom: 0.5px solid var(--primary-border);
            margin: 0px auto;
            padding: 12px;
          }

          .input textarea {
            padding-top: 10px;
            padding-left: 10px;

            height: 100%;
            width: 100%;
            -webkit-box-sizing: border-box; /* Safari/Chrome, other WebKit */
            -moz-box-sizing: border-box; /* Firefox, other Gecko */
            box-sizing: border-box; /* Opera/IE 8+ */
            border: none;
            overflow: auto;
            outline: none;
            border-right: 0.5px solid var(--primary-border);

            font-family: "Source Code Pro", courier, monospace;

            -webkit-box-shadow: none;
            -moz-box-shadow: none;
            box-shadow: none;

            color: var(--cm-color);
            background-color: var(--cm-background);
          }

          .container {
            min-height: 100vh;
          }

          .play-area {
            display: flex;
            min-height: 100vh;
          }

          .play-area > div {
            width: 50%;
          }
          .input {
            background-color: var(--cm-background);
          }
          .outputs {
            padding-left: 10px;
            padding-top: 10px;
            background-color: var(--cell-bg);
          }
        `}</style>
      </div>
    );
  }
}

export default MainApp;
