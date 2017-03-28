// @flow

import React from "react";

type Props = {
  cell: any
};

export default (props: Props) => (
  <pre className="raw-cell">
    {props.cell.get("source")}
  </pre>
);
