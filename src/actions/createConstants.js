/**
 * Small utility function to ease the creation of constants. Variadic,
 * so no need to pass in array.
 * @param  {Array-Like Object}  constants Strings to create constants based on.
 * @return {Object}             Object with constant keys, Symbol values.
 */
export default (...constants) => constants.reduce((acc, constant) => Object.assign(
  acc,
  { [constant]: constant }
), {});
