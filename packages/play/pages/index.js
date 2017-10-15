import React from "react";

import { Display } from "@nteract/display-area";

const Left = () => {
  return <div>left</div>;
};

const Right = () => {
  return <div>right</div>;
};

import { lightTheme, darkTheme } from "../styles";

const themes = {
  light: lightTheme,
  dark: darkTheme
};

class MainApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      theme: "light"
    };

    this.toggleTheme = () => {
      const theme = this.state.theme === "light" ? "dark" : "light";
      this.setState({ theme });
    };
  }

  render() {
    return (
      <div>
        <div className="container">
          <header onClick={this.toggleTheme}>Let's Play</header>
          <div className="play-area">
            <div className="input">left</div>
            <div className="outputs">
              <Display
                theme={this.state.theme}
                outputs={[
                  {
                    output_type: "display_data",
                    data: {
                      "application/vdom.v1+json": {
                        tagName: "h1",
                        children: "It works",
                        attributes: {}
                      },
                      "text/html": "<b>Woo</b>"
                    },
                    metadata: {}
                  }
                ]}
              />
            </div>
          </div>
        </div>

        <style jsx global>
          {themes[this.state.theme]}
        </style>

        <style jsx global>{`
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
            font-weight: bold;
            text-align: center;
            margin: 0px auto;
            padding: 12px;
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
            padding-left: 10px;
            padding-top: 10px;
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
