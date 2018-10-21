// @flow
import * as React from "react";
import { connect } from "react-redux";

import Main from "../components/Main";
import { actions } from "../redux";

function detectPlatform(req) {
  if (req && req.headers) {
    // Server side
    const userAgent = req.headers["user-agent"];
    if (/Windows/.test(userAgent)) {
      return "Windows";
    } else if (/Linux/.test(userAgent)) {
      return "Linux";
    }
    // Client side
  } else if (navigator.platform) {
    if (/Win/.test(navigator.platform)) {
      return "Windows";
    } else if (/Linux/.test(navigator.platform)) {
      return "Linux";
    }
  }
  // Else keep macOS default
  return "macOS";
}

class Page extends React.Component<*, *> {
  static async getInitialProps({ req, store, query }) {
    // Note that we cannot dispatch async actions in getInitialProps since it's
    // being handled server side. If we _need_ to do that, we should refactor
    // the related epics so that we can either (a) await them in some way or (b)
    // manually fetch the things we need and only dispatch the final,
    // synchronous actions.
    store.dispatch(actions.setPlatform(detectPlatform(req)));
    store.dispatch(actions.initalizeFromQuery(query));
  }
  render() {
    return <Main />;
  }
}

export default connect()(Page);
