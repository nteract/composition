// @flow
import React from "react";

import octicons from "../../icons/octicons";

import Link from "next/link";

import { theme } from "../../theme";

import { groupBy } from "lodash";

import type { Content } from "./types";
import TimeAgo from "react-timeago";

export type DirectoryListingProps = {
  contents: Array<Content>,
  basepath: string
};

const GroupedDirectoryListings = (props: DirectoryListingProps) => {
  const contents = props.contents.filter(row => !row.name.startsWith("."));

  if (contents.length <= 25) {
    return <DirectoryListing contents={contents} basepath={props.basepath} />;
  }

  const groups = groupBy(contents, item => item.name[0].toUpperCase());
  // Filter out dotfiles
  delete groups["."];

  if (Object.keys(groups).length <= 1) {
    return <DirectoryListing contents={contents} basepath={props.basepath} />;
  }

  const groupNames = Object.keys(groups).sort();

  const listings = groupNames.map(key => (
    <div key={key}>
      <div id={`group-${key}`} className="letterHeader">
        {key}
      </div>
      <DirectoryListing contents={groups[key]} basepath={props.basepath} />
      <style jsx>{`
        .letterHeader {
          padding-top: 1em;
          padding-bottom: 0.5em;
          padding-left: 6px;
        }
      `}</style>
    </div>
  ));

  return (
    <div>
      <div className="letters">
        {groupNames.map(x => (
          <a href={`#group-${x}`} key={x}>
            {x.toUpperCase()}
          </a>
        ))}
      </div>
      {listings}
      <style jsx>{`
        a {
          text-decoration: none;
          padding-right: 1em;
          color: ${theme.link};
        }
        .letters {
          padding-bottom: 1em;
          padding-left: 6px;
        }
      `}</style>
    </div>
  );
};

const DirectoryListing = (props: DirectoryListingProps) => {
  const base = props.basepath || "/";

  // filter out dotfiles
  const contents = props.contents.filter(row => !row.name.startsWith("."));

  return (
    <div>
      <div className="directory-listing">
        <table>
          <tbody>
            {contents.map((row, index) => {
              if (
                !row.type ||
                (row.type !== "notebook" &&
                  row.type !== "directory" &&
                  row.type !== "file")
              ) {
                return null;
              }

              const icon =
                row.type === "notebook" ? (
                  <octicons.Book />
                ) : row.type === "directory" ? (
                  <octicons.FileDirectory />
                ) : (
                  <octicons.FileText />
                );

              return (
                <tr key={index}>
                  <td className="icon">{icon}</td>
                  <td className="name">
                    <Link
                      href={{
                        pathname: "/view",
                        query: { viewPath: row.path }
                      }}
                      as={base + "/" + row.path}
                    >
                      <a>{row.name}</a>
                    </Link>
                  </td>
                  <td className="timeago">
                    <TimeAgo date={row.last_modified} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <style jsx>
        {`
          .icon {
            padding-right: 2px;
            padding-left: 10px;
            width: 17px;
            vertical-align: middle;
            text-align: center;
            color: ${theme.link};
            opacity: 0.95;
          }

          .name {
            color: ${theme.link};
            vertical-align: middle;
          }

          tr {
            border-top: 1px solid #eaecef;
          }

          td {
            padding: 6px 3px;
            text-align: left;
            line-height: 20px;
            vertical-align: top;
            text-overflow: ellipsis;
            white-space: nowrap;
            max-width: 100%;
          }

          td a {
            text-decoration: none;
            color: ${theme.link};
          }

          td a:hover {
            text-decoration: underline;
            outline-width: 0;
            color: ${theme.link};
          }

          tr:hover {
            background-color: #f6f8fa;
            transition: background-color 0.1s ease-out;
          }

          tr:first-child {
            border-top: none;
          }

          tr:last-child {
            border-bottom: none;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            border-radius: 2px;
            border-spacing: 0;
          }

          .directory-listing {
            margin-bottom: 10px;
            border-top: 0;
            border-radius: 3px;
          }

          .timeago {
            text-align: right;
            color: #6a737d;
            padding-right: 10px;
          }

          td a:hover {
            outline-width: 0;
            text-decoration: underline;
          }
        `}
      </style>
    </div>
  );
};

export default GroupedDirectoryListings;

// export default DirectoryListing;
