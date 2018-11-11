import * as React from "react";
import ReactTable from "react-table";
import withFixedColumns from "react-table-hoc-fixed-columns";

import ReactTableStyles from "../css/react-table";

const ReactTableFixedColumns = withFixedColumns(ReactTable);

export const DataResourceTransformGrid = ({
  data: { data, schema },
  height
}) => {
  const tableColumns = schema.fields.map(field => ({
    Header: field.name,
    accessor: field.name,
    fixed: schema.primaryKey.indexOf(field.name) !== -1 && "left"
  }));

  return (
    <div style={{ width: "calc(100vw - 150px)" }}>
      <ReactTableFixedColumns
        data={data}
        columns={tableColumns}
        style={{
          height: `${height}px`
        }}
        className="-striped -highlight"
      />
      <style jsx>{ReactTableStyles}</style>
    </div>
  );
};
