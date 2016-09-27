import React from 'react';

import Immutable from 'immutable';

import { transforms, displayOrder } from 'transformime-react';

import Output from './output';

export default function Display(props) {
  const order = props.displayOrder;
  const tf = props.transforms;
  return (
    <div className="cell_display">
      {
        props.outputs.map((output, index) =>
          <Output
            key={index}
            output={output}
            displayOrder={order}
            transforms={tf}
            theme={props.theme}
            comms={props.comms}
          />
        )
      }
    </div>
  );
}

Display.propTypes = {
  displayOrder: React.PropTypes.instanceOf(Immutable.List),
  outputs: React.PropTypes.instanceOf(Immutable.List),
  transforms: React.PropTypes.instanceOf(Immutable.Map),
  theme: React.PropTypes.string, // eslint-disable-line
  comms: React.PropTypes.any,
};

Display.defaultProps = {
  transforms,
  displayOrder,
};
