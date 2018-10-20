// @flow
import * as React from "react";

// const d3 = Object.assign({}, require("d3-dsv"));
// import DataTransform from "@nteract/transform-dataresource";

export default class CSVView extends React.Component<*> {
  shouldComponentUpdate() {
    return false;
  }

  render() {
    // const data = d3.csvParse(this.props.entry.content);
    return <div>No support for csv at this time</div>;
    // return <DataTransform data={{ data }} metadata={{}} theme="light" />;
  }
}
