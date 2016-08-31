import React from 'react';

const Plotly = require('plotly.js');

const MIMETYPE = 'application/json+plotly.v1';

export class PlotlyTransform extends React.Component {
  componentDidMount() {
    const payload = this.props.data.toJS();
    Plotly.newPlot(this.el, payload.data, payload.layout);
  }

  shouldComponentUpdate() {
    return false;
  }

  render() {
    return (
      <div ref={(el) => this.el = el} /> // eslint-disable-line
    );
  }
}

PlotlyTransform.propTypes = {
  data: React.PropTypes.any,
};

PlotlyTransform.MIMETYPE = MIMETYPE;

export default PlotlyTransform;
