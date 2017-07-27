/* @flow */
import React from "react";

const Viz = require("viz.js");

const MIMETYPE_GRAPHVIZ = "text/vnd.graphviz";

type Props = {
  data: string
};

class GraphViz extends React.Component {
  props: Props;
  static MIMETYPE = MIMETYPE_GRAPHVIZ;

  shouldComponentUpdate(nextProps: Props): boolean {
    return this.props.data !== nextProps.data;
  }

  render(): ?React.Element<any> {
    const svg = Viz(this.props.data);

    return (
      <img
        src={`data:image/svg+xml;charset=utf8,${encodeURIComponent(svg)}`}
        alt="graphviz output"
      />
    );
  }
}

export default GraphViz;
