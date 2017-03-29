import Immutable from "immutable";

import { createLogger } from "redux-logger";

module.exports = function clogger() {
  const logger = createLogger({
    // predicate: (getState, action) => action.type.includes('COMM'),
    stateTransformer: state =>
      Object.keys(state).reduce(
        (prev, key) =>
          Object.assign({}, prev, {
            [key]: Immutable.Iterable.isIterable(state[key])
              ? state[key].toJS()
              : state[key]
          }),
        {}
      )
  });
  return logger;
};
