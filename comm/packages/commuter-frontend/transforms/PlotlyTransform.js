/* @flow */
import React, { Component } from "react";
import { cloneDeep } from "lodash";
declare var Plotly: Object;
type Props = {
  data: string | Object
};

declare class PlotlyHTMLElement extends HTMLElement {
  data: Object,
  layout: ?Object
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

class PlotlyTransform extends Component<*> {
  props: Props;
  getFigure: () => Object;
  plotDivRef: (plotDiv: PlotlyHTMLElement | null) => void;
  plotDiv: PlotlyHTMLElement;

  static MIMETYPE = MIMETYPE;

  constructor(): void {
    super();
    this.getFigure = this.getFigure.bind(this);
    this.plotDivRef = this.plotDivRef.bind(this);
  }

  componentDidMount(): void {
    // Handle case of either string to be `JSON.parse`d or pure object
    const figure = this.getFigure();
    Plotly.newPlot(this.plotDiv, figure.data, figure.layout);
  }

  shouldComponentUpdate(nextProps: Props): boolean {
    return this.props.data !== nextProps.data;
  }

  componentDidUpdate() {
    const figure = this.getFigure();
    this.plotDiv.data = figure.data;
    this.plotDiv.layout = figure.layout;
    Plotly.redraw(this.plotDiv);
  }

  plotDivRef(plotDiv: PlotlyHTMLElement | null): void {
    if (plotDiv) {
      this.plotDiv = plotDiv;
    }
  }

  getFigure(): Object {
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
  }

  render(): React$Element<*> {
    const { layout } = this.getFigure();
    const style = {};
    if (layout && layout.height && !layout.autosize) {
      style.height = layout.height;
    }
    return <div ref={this.plotDivRef} style={style} />;
  }
}

export { PlotlyNullTransform };
export default PlotlyTransform;
