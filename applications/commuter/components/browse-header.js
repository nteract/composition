// @flow
import * as React from "react";
import Router from "next/router";

import NextLink from "next/link";
import { trim } from "lodash";

import { theme } from "../theme";

// Convert simple links to next style href + as
const Link = ({ to, children, basepath }) => (
  <NextLink
    href={{ pathname: "/view", query: { viewPath: to } }}
    as={basepath + "/" + to}
  >
    {children}
  </NextLink>
);

class BrowseHeader extends React.Component<*> {
  props: {
    path: string,
    basepath: string,
    type: string,
    commuterExecuteLink: ?string
  };

  static defaultProps = {
    active: "view"
  };

  handleItemClick = (e: SyntheticEvent<*>, { name }: { name: string }) => {
    Router.push(name);
  };

  render() {
    const { path, basepath } = this.props;
    let paths = trim(path, "/").split("/");
    // Empty path to start off
    if (paths.length === 1 && paths[0] === "") {
      paths = [];
    }

    // TODO: Ensure this works under an app subpath (which is not implemented yet)
    const filePath = basepath.replace(/view\/?/, "files/") + path;

    // const serverSide = typeof document === "undefined";
    const viewingNotebook = filePath.endsWith(".ipynb");

    return (
      <nav>
        <ul className="breadcrumbs">
          <li>
            <Link to={``} basepath={basepath}>
              <a>
                <span>home</span>
              </a>
            </Link>
          </li>
          {paths.map((name, index) => {
            const filePath = paths.slice(0, index + 1).join("/");
            return (
              <li key={`${filePath}`}>
                <Link to={`${filePath}`} basepath={basepath}>
                  <a>
                    <span>{name}</span>
                  </a>
                </Link>
              </li>
            );
          })}
        </ul>
        {this.props.type === "directory" ? null : (
          <React.Fragment>
            {this.props.commuterExecuteLink && viewingNotebook ? (
              <a
                href={`${this.props.commuterExecuteLink}/${path}`}
                className="ops"
              >
                Run
              </a>
            ) : null}
            <a href={filePath} download className="ops">
              Download
            </a>
          </React.Fragment>
        )}
        <style jsx>{`
          nav {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border: 1px solid ${theme.outline};
            padding: 0 1rem;
          }
          ul.breadcrumbs {
            display: flex;
            position: relative;

            margin: 0 0 0 0;
            padding: 0;

            list-style: none;
            background: #ffffff;
            font-family: "Source Sans Pro";
            font-size: 16px;
            color: ${theme.primary};
          }

          ul.breadcrumbs li {
            flex-direction: row;
            list-style-type: none;
            display: inline;
            text-align: center;
            display: flex;
            align-items: center;
          }

          ul.breadcrumbs li a {
            vertical-align: middle;
            display: table;
            padding: 1em;
            color: ${theme.primary};
            text-decoration: none;
          }

          ul.breadcrumbs li a:hover {
            text-decoration: underline;
          }

          ul.breadcrumbs li:last-child a {
            color: ${theme.active};
            text-decoration: none;
            cursor: pointer;
          }

          ul.breadcrumbs li + li:before {
            content: "›";
            color: ${theme.active};
          }

          .ops {
            display: inline-block;
            line-height: 2em;
            padding: 0 8px;
            border-radius: 2px;
            background-color: ${theme.background};
            border: 1px solid ${theme.outline};
            color: #000;
            text-decoration: none;
          }

          .ops:hover {
            background-color: ${theme.outline};
            transition: background-color 0.25s ease-out;
          }

          .ops:active {
            background-color: ${theme.primary};
            color: ${theme.active};
            transition: background-color 0.5s ease-out, color 6s ease-out;
          }

          .ops:not(:last-child) {
            margin-right: 10px;
          }
        `}</style>
      </nav>
    );
  }
}

export default BrowseHeader;
