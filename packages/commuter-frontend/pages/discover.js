// @flow
import * as React from "react";
require("isomorphic-fetch");
import TimeAgo from "react-timeago";

import NextLink from "next/link";

import Header from "../components/header";
import Body from "../components/body";

import { theme } from "../theme";

const Authors = props => (
  <span className="authors">
    {props.authors.map(author => author.name).join(", ")}
  </span>
);

const Tag = props => (
  <span>
    <span className="tag">{props.children}</span>
    <style jsx>{`
      .tag {
        display: inline-block;
        padding: 0.2em 0.9em;
        margin: 0 0.5em 0.5em 0;
        white-space: nowrap;
        background-color: #f1f8ff;
        border-radius: 3px;
        color: #0366d6;
        text-decoration: none;
      }
      tag:hover {
        background-color: #ddeeff;
      }
    `}</style>
  </span>
);

type DiscoveryItemProps = {
  image: string,
  path: string,
  metadata: any,
  name: string,
  last_modified: string
};

const DiscoveryItem = (props: DiscoveryItemProps) => (
  <div className="post">
    <div className="post-thumb">
      <img
        src={
          props.image ? props.image : "https://icon.now.sh/library_books/ccc/64"
        }
        height="64"
      />
    </div>
    <div className="post-summary">
      <h3 className="post-title">
        <NextLink
          href={{ pathname: "/view", query: { viewPath: props.path } }}
          as={"/view/" + props.path}
        >
          <a>{props.metadata.title ? props.metadata.title : props.name}</a>
        </NextLink>
      </h3>
      <div className="post-metadata">
        <span>
          {/* $FlowFixMe unsure what the typing issue is here */}
          Last modified <TimeAgo date={props.last_modified} />
        </span>
        {` `}
        {props.metadata.authors ? (
          <span>
            by <Authors authors={props.metadata.authors} />
          </span>
        ) : null}
      </div>
      <div className="post-description">
        <p>{props.metadata.nteract.description}</p>
      </div>
      <div className="post-tags">
        {props.metadata.nteract.tags.map(tag => <Tag key={tag}>{tag}</Tag>)}
      </div>
    </div>
    <style jsx>{`
      .post {
        display: flex;
        flex-direction: row;
        border-bottom: 1px #e1e4e8 solid !important;
        padding-top: 24px !important;
        padding-bottom: 24px !important;
      }

      h3 {
        font-size: 20px;
        font-weight: 600;
        margin-top: 0;
        margin-bottom: 4px;
      }

      a {
        color: #0366d6;
        text-decoration: none;
      }

      .post-metadata {
        font-style: italic;
      }
      .post-metadata,
      .post-description {
        color: #586069 !important;
      }

      .post-summary {
        margin-left: 2rem;
      }

      .post-tags {
        margin-top: 0.5rem;
      }
    `}</style>
  </div>
);

class DiscoveryGrid extends React.Component<*> {
  static async getInitialProps({ req }) {
    let BASE_PATH;

    if (req) {
      // Server side, communicate with our local API
      const port = process.env.COMMUTER_PORT || 4000;
      BASE_PATH = `http://127.0.0.1:${port}/`;
    } else {
      BASE_PATH = "/";
    }

    const url = `${BASE_PATH}api/v1/discovery`;
    const res = await fetch(url);

    const statusCode = res.status > 200 ? res.status : false;

    const json = await res.json();

    return {
      discovered: json.results,
      statusCode
    };
  }

  render() {
    if (this.props.discovered.length === 0) {
      return (
        <div>
          <Header />
          <Body>
            <h1>No discoveries...</h1>
          </Body>
        </div>
      );
    }

    return (
      <div>
        <Header active="discover" />
        <Body>
          <div>
            <div className="discoveries">
              {this.props.discovered
                ? this.props.discovered.map(item => (
                    <DiscoveryItem key={item.path} {...item} />
                  ))
                : null}
            </div>
            <style jsx>{`
              .discoveries {
                margin-top: 1rem;
                margin-left: 1rem;
                margin-right: 1rem;
              }

              .discoveries > * {
                display: block;
              }
            `}</style>
          </div>
        </Body>
      </div>
    );
  }
}

export default DiscoveryGrid;
