// @flow
const d3 = Object.assign({}, require("d3-dsv"));

import React from "react";
// $FlowFixMe: our flow config isn't picking up modules that package separate .js.flow files
import DataTransform from "@nteract/transform-dataresource";

export default class CSVView extends React.Component<*> {
  shouldComponentUpdate() {
    return false;
  }

  render() {
    const data = d3.csvParse(this.props.entry.content);
    return (
      <div>
        <DataTransform data={{ data }} theme="light" />
      </div>
    );
  }
}
