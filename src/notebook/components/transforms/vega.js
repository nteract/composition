import React from 'react';

const embed = require('vega-embed');

const MIMETYPE = 'application/json+vega-embed.v1';

export class VegaTransform extends React.Component {
  componentDidMount() {
    const payload = this.props.data.toJS();
    embed(this.el, payload, (error, result) => {
      if (error) {
        console.error(error);
      }
      console.warn(result);
    });
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

VegaTransform.propTypes = {
  data: React.PropTypes.any,
};

VegaTransform.MIMETYPE = MIMETYPE;

export default VegaTransform;
