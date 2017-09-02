/* @flow */
import React from "react";
import VirtualizedGrid from "./virtualized-grid";
// import VirtualizedTable from './virtualized-table';

type Props = {
  data: Object,
  theme?: string,
  expanded?: boolean,
  height?: number
};

class DataResourceTransform extends React.Component<Props> {
  static MIMETYPE = "application/vnd.dataresource+json";

  shouldComponentUpdate(): boolean {
    return true;
  }

  render(): ?React$Element<any> {
    const { data: { data, schema }, theme, expanded, height } = this.props;
    return (
      <VirtualizedGrid
        data={data}
        schema={schema}
        theme={theme}
        expanded={expanded}
        height={height}
        // style={{ marginRight: "10px" }}
      />
    );
  }
}

export default DataResourceTransform;
