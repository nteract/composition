/* @flow strict */
import { isCollection } from "immutable";

import { createLogger } from "redux-logger";

export function clogger() {
  const logger = createLogger({
    // predicate: (getState, action) => action.type.includes('COMM'),
    stateTransformer: state =>
      Object.keys(state).reduce(
        (prev, key) =>
          Object.assign({}, prev, {
            [key]: isCollection(state[key]) ? state[key].toJS() : state[key]
          }),
        {}
      )
  });
  return logger;
}

export default clogger;
