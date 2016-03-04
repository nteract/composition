/**
 * Small utility function which eases the creation of reducers. Takes a map with
 * constants as keys, and reducre functions as values, and returns a reducer
 * function ready to be fed to redux's `combineReducer` function.
 * @param  {Object} reducerMap   Map of constants / reducers
 * @param  {Object} initialState Initial state for this sub-reducer
 * @return {Function}            Redux-compliant reducer
 */
export default (reducerMap, initialState) => (state = initialState, action) => {
  const reduce = reducerMap[action.type];

  return reduce ? reduce(state, action) : state;
};
