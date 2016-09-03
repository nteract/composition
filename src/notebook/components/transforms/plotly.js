import React from 'react';

const Plotly = require('plotly.js/dist/plotly');

const MIMETYPE = 'application/vnd.plotly.v1+json';

class PlotlyTransform extends React.Component {
  componentDidMount() {
    const payload = this.props.data;
    Plotly.newPlot(this.el, payload.data, payload.layout);
  }

  shouldComponentUpdate() {
    return false;
  }

  render() {
    const { layout } = this.props.data;
    const style = {};
    if (layout && layout.height && !layout.autosize) {
      style.height = layout.height;
    }
    return (
      <div style={style} ref={(el) => this.el = el} /> // eslint-disable-line
    );
  }
}

function MapPlotlyTransform(props) {
  const data = JSON.parse(props.data);
  return <PlotlyTransform data={data} />;
}

MapPlotlyTransform.propTypes = PlotlyTransform.propTypes = {
  data: React.PropTypes.any,
};

MapPlotlyTransform.MIMETYPE = PlotlyTransform.MIMETYPE = MIMETYPE;

export default MapPlotlyTransform;
