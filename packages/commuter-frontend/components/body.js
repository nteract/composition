// @flow
import * as React from "react";

import type { ChildrenArray } from "react";

type BodyProps = {
  children?: React.Node
};

const Body = (props: BodyProps) => {
  return (
    <div>
      <div className="main-container">{props.children}</div>
    </div>
  );
};

export default Body;
