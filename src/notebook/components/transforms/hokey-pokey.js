/* eslint class-methods-use-this: 0 */

import React, { PropTypes } from 'react';

const MIMETYPE = 'application/hokey+json';

export class HokeyTransform extends React.Component {
  render() {
    console.warn(this.props);
    const comms = this.props.comms;
    if (!comms) { return null; }

    return (
      <pre>
      {
        JSON.stringify(comms.toJS())
      }
      </pre>
    );
  }
}

HokeyTransform.propTypes = {
  comms: PropTypes.any,
};

HokeyTransform.MIMETYPE = MIMETYPE;

export default HokeyTransform;
