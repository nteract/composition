// @flow
import { hot } from "react-hot-loader";

import * as React from "react";

import NotificationSystem from "react-notification-system";

import { Styles, themes } from "@nteract/presentational-components";
import { default as Contents } from "./contents";
import type { ContentRef } from "@nteract/core";

class App extends React.Component<{ contentRef: ContentRef }, null> {
  notificationSystem: NotificationSystem;
  render() {
    return (
      <React.Fragment>
        <Styles>
          <Contents contentRef={this.props.contentRef} />
        </Styles>
        <NotificationSystem
          ref={notificationSystem => {
            this.notificationSystem = notificationSystem;
          }}
        />
        <style jsx global>{`
        :root {${themes.light}}
        body {
          font-family: "Source Sans Pro";
          font-size: 16px;
          background-color: var(--theme-app-bg);
          color: var(--theme-app-fg);
          margin: 0;
        }

        #app {
          padding-top: 20px;
        }

        @keyframes fadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }

        div#loading {
          animation-name: fadeOut;
          animation-duration: 0.25s;
          animation-fill-mode: forwards;
        }
      `}</style>
      </React.Fragment>
    );
  }
}

export default hot(module)(App);
