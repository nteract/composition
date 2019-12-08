import React from "react";

import Cells from "./cells/cells";

interface ComponentProps {
  contentRef: string;
}

export class Notebook extends React.Component<ComponentProps> {
  render() {
    const { contentRef } = this.props;
    return <Cells contentRef={contentRef} />;
  }
}
