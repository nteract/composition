// @flow
import React from "react";
import { Notebook } from "../components/notebook";

type ContentsProps = {
  contents: Object
};

export default (props: ContentsProps) => {
  if (props.contents) {
    const contents = props.contents;
    switch (contents.type) {
      case "notebook":
        return <Notebook content={contents.content} />;
      default:
        return <pre>{JSON.stringify(contents, null, 2)}</pre>;
    }
  }
  return null;
};
