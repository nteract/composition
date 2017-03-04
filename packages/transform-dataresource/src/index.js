/* @flow */
import React from "react";

// import VirtualizedGrid from "./virtualized-grid";
import VirtualizedTable from "./virtualized-table";

type Props = {
  data: Object
};

class DataResourceTransform extends React.Component {
  props: Props;
  static MIMETYPE = "application/vnd.dataresource+json";

  shouldComponentUpdate(): boolean {
    return true;
  }

  render(): ?React.Element<any> {
    const { data, schema } = this.props.data;
    return (
      <VirtualizedTable
        data={data}
        schema={schema}
        style={{ marginRight: "10px" }}
      />
    );
  }
}

export default DataResourceTransform;
