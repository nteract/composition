import React from 'react';
import Immutable from 'immutable';

import { richestMimetype, transforms, displayOrder } from 'transformime-react';

export default class RichestMime extends React.Component {
  static propTypes = {
    displayOrder: React.PropTypes.instanceOf(Immutable.List).isRequired,
    transforms: React.PropTypes.instanceOf(Immutable.Map).isRequired,
    bundle: React.PropTypes.instanceOf(Immutable.Map).isRequired,
    metadata: React.PropTypes.instanceOf(Immutable.Map).isRequired,
    theme: React.PropTypes.string,
    comms: React.PropTypes.any,
  };

  shouldComponentUpdate(nextProps) {  // eslint-disable-line class-methods-use-this
    /** if (nextProps && nextProps.theme && this.props && nextProps.theme !== this.props.theme &&
        nextProps.comms !== this.props.comms) {
      return true;
    }
    return false;**/

    return true;
  }

  render() {
    const mimetype = richestMimetype(
      this.props.bundle,
      this.props.displayOrder,
      this.props.transforms
    );

    if (!mimetype) {
      // If no mimetype is supported, don't return a component
      return null;
    }

    const Transform = this.props.transforms.get(mimetype);
    const data = this.props.bundle.get(mimetype);
    const metadata = this.props.metadata.get(mimetype);
    return (
      <Transform
        data={data}
        metadata={metadata}
        theme={this.props.theme}
        comms={this.props.comms}
      />
    );
  }
}

RichestMime.defaultProps = {
  transforms,
  displayOrder,
  theme: 'light',
  metadata: new Immutable.Map(),
  bundle: new Immutable.Map(),
};
