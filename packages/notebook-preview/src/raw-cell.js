// @flow

import React from "react";

type Props = {
  cell: any
};

export default (props: Props) => (
  <pre
    className="raw-cell"
    style={{
      background: "repeating-linear-gradient(-45deg, transparent, transparent 10px, #efefef 10px, #f1f1f1 20px)"
    }}
  >
    {props.cell.get("source")}
  </pre>
);
