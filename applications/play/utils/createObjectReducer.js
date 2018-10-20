// @flow
/**
 * Similar to how combineReducers allows you to create a container reducer to
 * delegate actions where each key maps to a reducer to handle the key's value--
 * createObjectReducer allows you to create a container reducer to delegate
 * actions where *all* keys use the *same* reducer, but the keys are not known
 * ahead of time.
 * @param {Object} config The configuration object used to create the reducer.
 * @param {Function} config.getKey Accepts an `action` param and returns a key.
 * @param {Function} config.valueReducer A standard redux reducer function.
 * @returns {Function} A standard redux reducer function.
 */
const createObjectReducer = (config: *) => (state: * = {}, action: *) => {
  const key = config.getKey(action);
  if (typeof key !== "undefined") {
    const previousValueState = state[key];
    const nextValueState = config.valueReducer(state[key], action);
    // Don't return a new object if nothing changed to prevent diffs.
    if (nextValueState !== previousValueState) {
      return { ...state, [key]: nextValueState };
    }
  }
  return state;
};

export default createObjectReducer;
