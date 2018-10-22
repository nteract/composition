// @flow
import * as React from "react";
import NotebookPreview from "@nteract/notebook-preview";
import Markdown from "@nteract/markdown";
import { Styles, Source } from "@nteract/presentational-components";
import {
  standardTransforms,
  standardDisplayOrder,
  registerTransform
} from "@nteract/transforms";
import { VegaLite1, VegaLite2, Vega2, Vega3 } from "@nteract/transform-vega";
// import DataResourceTransform from "@nteract/transform-dataresource";

import { PlotlyNullTransform, PlotlyTransform } from "../../transforms";

import DirectoryListing from "./directory-listing";
import HTMLView from "./html";
import JSONView from "./json";
import CSVView from "./csv";

const jquery = require("jquery");

// HACK: Temporarily provide jquery for others to use...
global.jquery = jquery;
global.$ = jquery;

// Order is important here. The last transform in the array will have order `0`.
const { transforms, displayOrder } = [
  // DataResourceTransform,
  PlotlyNullTransform,
  PlotlyTransform,
  VegaLite1,
  VegaLite2,
  Vega2,
  Vega3
].reduce(registerTransform, {
  transforms: standardTransforms,
  displayOrder: standardDisplayOrder
});

const suffixRegex = /(?:\.([^.]+))?$/;

class File extends React.Component<*> {
  shouldComponentUpdate() {
    return false;
  }

  render() {
    const name = this.props.entry.name;
    const presuffix = suffixRegex.exec(name);

    if (!presuffix) {
      return null;
    }

    const suffix = (presuffix[1] || "").toLowerCase();

    switch (suffix) {
      case "html":
        return <HTMLView entry={this.props.entry} />;
      case "json":
        return <JSONView entry={this.props.entry} />;
      case "csv":
        return <CSVView entry={this.props.entry} />;
      case "md":
      case "markdown":
      case "rmd":
        return <Markdown source={this.props.entry.content} />;
      case "js":
        return (
          <Source language="javascript">{this.props.entry.content}</Source>
        );
      case "py":
      case "pyx":
        return <Source language="python">{this.props.entry.content}</Source>;
      case "gif":
      case "jpeg":
      case "jpg":
      case "png":
        return (
          <img
            src={`/files/${this.props.pathname}`}
            alt={this.props.pathname}
          />
        );
      default:
        if (this.props.entry.format === "text") {
          return (
            <Source language="text/plain">{this.props.entry.content}</Source>
          );
        }
        return <a href={`/files/${this.props.pathname}`}>Download raw file</a>;
    }
  }
}

type EntryProps = {
  entry: JupyterApi$Content,
  pathname: string,
  basepath: string
};

export const Entry = (props: EntryProps) => {
  if (props.entry.content === null) {
    return null;
  }

  switch (props.entry.type) {
    case "directory":
      // Dynamic type check on content being an Array
      if (Array.isArray(props.entry.content)) {
        return (
          <DirectoryListing contents={props.entry.content} basepath={"/view"} />
        );
      }
      return null;
    case "file":
      // TODO: Case off various file types (by extension, mimetype)
      return <File entry={props.entry} pathname={props.pathname} />;
    case "notebook":
      return (
        <Styles>
          <NotebookPreview
            notebook={props.entry.content}
            displayOrder={displayOrder}
            transforms={transforms}
          />
        </Styles>
      );
    default:
      return <pre>{JSON.stringify(props.entry.content)}</pre>;
  }
};
