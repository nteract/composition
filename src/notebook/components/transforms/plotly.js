/* @flow */
/* eslint class-methods-use-this: 0 */
import React, { PropTypes } from 'react';

type Props = {
  data: string|Object,
};

const Plotly = require('plotly.js/dist/plotly');

const MIMETYPE = 'application/vnd.plotly.v1+json';

export class PlotlyTransform extends React.Component {
  props: Props;
  getFigure: () => Object;
  el: HTMLElement;

  static MIMETYPE = MIMETYPE;

  constructor(): void {
    super();
    this.getFigure = this.getFigure.bind(this);
  }

  componentDidMount(): void {
    // Handle case of either string to be `JSON.parse`d or pure object
    const figure = this.getFigure();
    Plotly.newPlot(this.el, figure.data, figure.layout);
  }

  shouldComponentUpdate(nextProps: Props): boolean {
    return this.props.data !== nextProps.data;
  }

  componentDidUpdate() {
    const figure = this.getFigure();
    this.el.data = figure.data;
    this.el.layout = figure.layout;
    Plotly.redraw(this.el);
  }

  getFigure(): Object {
    const figure = this.props.data;
    if (typeof figure === 'string') {
      return JSON.parse(figure);
    }
    // assume immutable.js
    return figure.toJS();
  }

  render(): ?React.Element<any> {
    const { layout } = this.getFigure();
    const style = {};
    if (layout && layout.height && !layout.autosize) {
      style.height = layout.height;
    }
    return (
      <div style={style} ref={(el) => { this.el = el; }} />
    );
  }
}

export default PlotlyTransform;
