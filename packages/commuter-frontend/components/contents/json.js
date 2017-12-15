import React from "react";

import ZeppelinView from "./zeppelin";

import JSONTransform from "@nteract/transforms/lib/json";

import Immutable from "immutable";

export default props => {
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
      <div>
        <h1>Failed to parse Zeppelin Notebook</h1>
        <pre>{e.toString()}</pre>
        <code>{this.props.entry.content}</code>
      </div>
    );
  }
};
