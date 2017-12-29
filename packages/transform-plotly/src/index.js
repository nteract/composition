/* @flow */
/* eslint class-methods-use-this: 0 */
import React from "react";

const cloneDeep = require("lodash").cloneDeep;

type Props = {
  data: string | Object
};

declare class PlotlyHTMLElement extends HTMLElement {
  data: Object;
  layout: Object;
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

export class PlotlyTransform extends React.Component<Props> {
  plotDiv: ?PlotlyHTMLElement;
  Plotly: Object;

  static MIMETYPE = MIMETYPE;

  componentDidMount(): void {
    // Handle case of either string to be `JSON.parse`d or pure object
    const figure = this.getFigure();
    this.Plotly = require("@nteract/plotly");
    this.Plotly.newPlot(this.plotDiv, figure.data, figure.layout);
  }

  shouldComponentUpdate(nextProps: Props): boolean {
    return this.props.data !== nextProps.data;
  }

  componentDidUpdate() {
    const figure = this.getFigure();
    if (!this.plotDiv) return;
    this.plotDiv.data = figure.data;
    this.plotDiv.layout = figure.layout;
    this.Plotly.redraw(this.plotDiv);
  }

  plotDivRef = (plotDiv: PlotlyHTMLElement | null): void => {
    this.plotDiv = plotDiv;
  };

  getFigure = (): Object => {
    const figure = this.props.data;
    if (typeof figure === "string") {
      return JSON.parse(figure);
    }

    // The Plotly API *mutates* the figure to include a UID, which means
    // they won't take our frozen objects
    if (Object.isFrozen(figure)) {
      return cloneDeep(figure);
    }
    return figure;
  };

  render(): ?React$Element<any> {
    const { layout } = this.getFigure();
    const style = {};
    if (layout && layout.height && !layout.autosize) {
      style.height = layout.height;
    }
    // $FlowFixMe: Address typings on ref
    return <div ref={this.plotDivRef} style={style} />;
  }
}

export { PlotlyNullTransform };
export default PlotlyTransform;
