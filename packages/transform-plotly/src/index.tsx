/* eslint class-methods-use-this: 0 */
import { cloneDeep } from "lodash";
import React from "react";

interface Props {
  data: string | object;
  mediaType: "application/vnd.plotly.v1+json";
}

type ObjectType = object;

interface FigureLayout extends ObjectType {
  height?: string;
  autosize?: boolean;
}

interface Figure extends ObjectType {
  data: object;
  layout: FigureLayout;
}

declare class PlotlyHTMLElement extends HTMLDivElement {
  data: object;
  layout: object;
  newPlot: () => void;
  redraw: () => void;
}

const NULL_MIMETYPE = "text/vnd.plotly.v1+html";
const MIMETYPE = "application/vnd.plotly.v1+json";

/*
 * As part of the init notebook mode, Plotly sneaks a <script> tag in to load
 * the plotlyjs lib. We have already loaded this though, so we "handle" the
 * transform by doing nothing and returning null.
 */
const PlotlyNullTransform = () => null;
PlotlyNullTransform.MIMETYPE = NULL_MIMETYPE;
PlotlyNullTransform.defaultProps = {
  mediaType: NULL_MIMETYPE
};

export class PlotlyTransform extends React.Component<Props> {
  static MIMETYPE = MIMETYPE;

  static defaultProps = {
    mediaType: MIMETYPE
  };

  plotDiv?: PlotlyHTMLElement | null;
  Plotly!: {
    newPlot: (
      div: PlotlyHTMLElement | null | undefined,
      data: object,
      layout: FigureLayout
    ) => void;
    redraw: (div?: PlotlyHTMLElement) => void;
  };

  componentDidMount(): void {
    // Handle case of either string to be `JSON.parse`d or pure object
    const figure = this.getFigure();
    this.Plotly = require("plotly.js-dist");
    this.Plotly.newPlot(this.plotDiv, figure.data, figure.layout);
  }

  shouldComponentUpdate(nextProps: Props): boolean {
    return this.props.data !== nextProps.data;
  }

  componentDidUpdate() {
    const figure = this.getFigure();
    if (!this.plotDiv) {
      return;
    }
    this.plotDiv.data = figure.data;
    this.plotDiv.layout = figure.layout;
    this.Plotly.redraw(this.plotDiv);
  }

  plotDivRef = (plotDiv: PlotlyHTMLElement | null): void => {
    this.plotDiv = plotDiv;
  };

  getFigure = (): Figure => {
    const figure = this.props.data;
    if (typeof figure === "string") {
      return JSON.parse(figure);
    }

    // The Plotly API *mutates* the figure to include a UID, which means
    // they won't take our frozen objects
    if (Object.isFrozen(figure)) {
      return cloneDeep(figure) as Figure;
    }

    const { data = {}, layout = {} } = figure as Figure;

    return { data, layout };
  };

  render() {
    const { layout } = this.getFigure();
    const style: React.CSSProperties = {};
    if (layout && layout.height && !layout.autosize) {
      style.height = layout.height;
    }
    return <div ref={this.plotDivRef} style={style} />;
  }
}

export { PlotlyNullTransform };
export default PlotlyTransform;
