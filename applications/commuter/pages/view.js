// @flow
import * as React from "react";

import { getJSON } from "../shims/ajax";
import Header from "../components/header";
import BrowseHeader from "../components/browse-header";
import Body from "../components/body";
import { Entry } from "../components/contents";

type ServerConfig = {
  commuterExecuteLink?: string
};

type ViewPageProps = {
  contents: any,
  statusCode: any,
  viewPath: any,
  serverConfig: ServerConfig
};

type ViewPageState = {
  config: ServerConfig
};

class ViewPage extends React.Component<ViewPageProps, ViewPageState> {
  static async getInitialProps(context: Object) {
    const req = context.req;
    const query = context.query;
    // Later, we'll use this to fill in the notebook
    // file data from the server side (or fallback to /api/contents)
    // For now, leaving "server": boolean to assist in debugging
    // during the refactor
    // The best choice will be to rely only on client side for now
    // I'm sure

    const config = {};
    config.commuterExecuteLink = process.env.COMMUTER_EXECUTE_LINK;

    const viewPath = query.viewPath || "/";

    let BASE_PATH;

    if (req) {
      // Server side, communicate with our local API
      const port = process.env.COMMUTER_PORT || 4000;
      BASE_PATH = `http://127.0.0.1:${port}/`;
    } else {
      BASE_PATH = "/";
    }

    const url = `${BASE_PATH}api/contents/${viewPath}`;

    const xhr = await getJSON(url).toPromise();

    return {
      contents: xhr.response,
      statusCode: xhr.status,
      viewPath,
      serverConfig: config
    };
  }

  constructor(props: ViewPageProps) {
    super(props);
    let config = {};
    if (props.serverConfig) {
      this.state = { config: props.serverConfig };
    } else {
      const configScriptElement = document.getElementById("serverConfig");
      if (configScriptElement !== null) {
        config = JSON.parse(configScriptElement.textContent);
      }
      this.state = { config };
    }
  }

  render() {
    if (this.props.statusCode !== 200) {
      return `Nothing found for ${this.props.viewPath}`;
    }

    return (
      <React.Fragment>
        <Header />
        <BrowseHeader
          basepath={"/view"}
          path={this.props.viewPath}
          type={this.props.contents.type}
          commuterExecuteLink={this.state.config.commuterExecuteLink}
        />
        <Body>
          {/* Entry */}
          <div className="entry">
            <Entry
              entry={this.props.contents}
              pathname={this.props.viewPath}
              basepath={"/view"}
            />
            <style jsx>{`
              margin-top: 2rem;
              padding-left: 2rem;
              padding-right: 2rem;
            `}</style>
          </div>
        </Body>
      </React.Fragment>
    );
  }
}

export default ViewPage;
