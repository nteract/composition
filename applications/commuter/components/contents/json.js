// @flow
import * as React from "react";
import { JSONTransform } from "@nteract/transforms";
import Immutable from "immutable";

import ZeppelinView from "./zeppelin";

export default (props: *) => {
  const content = JSON.parse(props.entry.content);
  try {
    // Zeppelin notebooks are called note.json, we'll go ahead and render them
    if (props.entry.name === "note.json") {
      return <ZeppelinView notebook={content} />;
    }

    return (
      <JSONTransform
        data={content}
        metadata={Immutable.Map({
          expanded: true
        })}
      />
    );
  } catch (e) {
    return (
      <React.Fragment>
        <h1>Failed to parse Zeppelin Notebook</h1>
        <pre>{e.toString()}</pre>
        <code>{props.entry.content}</code>
      </React.Fragment>
    );
  }
};
