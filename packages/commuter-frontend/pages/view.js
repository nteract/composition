// @flow
import * as React from "react";
import Link from "next/link";
require("isomorphic-fetch");

import { join as pathJoin } from "path";

import Header from "../components/header";
import BrowseHeader from "../components/browse-header";
import Body from "../components/body";

import { Entry } from "../components/contents";

class ViewPage extends React.Component<*> {
  static async getInitialProps({ req, query }) {
    // Later, we'll use this to fill in the notebook
    // file data from the server side (or fallback to /api/contents)
    // For now, leaving "server": boolean to assist in debugging
    // during the refactor
    // The best choice will be to rely only on client side for now
    // I'm sure

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

    const res = await fetch(url);

    const statusCode = res.status > 200 ? res.status : false;
    const json = await res.json();

    return {
      contents: json,
      statusCode,
      viewPath
    };
  }

  render() {
    console.log(this.props.services);
    if (this.props.statusCode) {
      return <div>{`Nothing found for ${this.props.viewPath}`}</div>;
    }

    return (
      <div>
        <Header />
        <BrowseHeader
          basepath={"/view"}
          path={this.props.viewPath}
          type={this.props.contents.type}
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
      </div>
    );
  }
}

export default ViewPage;
