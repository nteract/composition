import React from 'react';

import * as V from 'victory';

/**
 * We'll establish a standard here that we will expect to receive JSON like so:

{
  name='VictoryBar',
  data=[
    {x: 1, y: 1},
    {x: 2, y: 2},
    {x: 3, y: 3},
    {x: 4, y: 2},
    {x: 5, y: 1}
  ],
  ...innerProps
}

*/

const MIMETYPE = 'application/json+victory.v1';

const VictoryTransform = (props) => {
  // Victory likes vanilla JS
  const payload = props.data.toJS();
  const VictoryComponent = V[payload.name];

  return (
    <VictoryComponent {...payload} />
  );
};

VictoryTransform.propTypes = {
  data: React.PropTypes.any,
};

VictoryTransform.MIMETYPE = MIMETYPE;

export default VictoryTransform;
