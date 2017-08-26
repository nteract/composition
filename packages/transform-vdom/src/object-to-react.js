/* @flow */

/**
 * The original copy of this comes from
 * https://github.com/remarkablemark/REON/blob/1f126e71c17f96daad518abffdb2c53b66b8b792/lib/object-to-react.js
 *
 * MIT License
 *
 * Copyright (c) 2016 Menglin "Mark" Xu <mark@remarkablemark.org>
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

const React = require("react");

/**
 * Convert an object to React element(s).
 *
 * The object schema should be similar to React element's.
 * Note: The object passed in this function will be mutated.
 *
 * @param  {Object}       obj - The element object.
 * @return {ReactElement}
 */
export function objectToReactElement(obj: Object): React$Element<*> {
  // Pack args for React.createElement
  var args = [];
  var children;

  // `React.createElement` 1st argument: type
  args[0] = obj.type;

  // `props` should always be defined
  // it can be an empty object or contain the React props and/or children
  if (obj.props) {
    // save reference to `children` and remove `children` from `props`
    // as it shouldn't be passed as a prop in `React.createElement`
    if (obj.props.children) {
      children = obj.props.children;
      obj.props.children = null; // more performant than `delete`
    }

    // set `key` in `prop`
    if (obj.key !== undefined && obj.key !== null) {
      obj.props.key = obj.key;
    }

    // `React.createElement` 2nd argument: props
    args[1] = obj.props;
  }

  // `props.children`
  if (children) {
    // third argument: children (mixed values)
    switch (children.constructor) {
      // text
      case String:
        args[2] = children;
        break;
      // React element
      case Object:
        args[2] = objectToReactElement(children);
        break;
      // array (mixed values)
      case Array:
        // to be safe (although this should never happen)
        if (args[1] === undefined) {
          args[1] = null;
        }
        args = args.concat(arrayToReactChildren(children));
        break;
      default:
      // pass
    }
  }

  return React.createElement.apply({}, args);
}

/**
 * Convert an array of items to React children.
 *
 * @param  {Array} arr - The array.
 * @return {Array}     - The array of mixed values.
 */
export function arrayToReactChildren(arr: Array<any>): Array<any> {
  // similar to `props.children`
  var result = [];
  // child of `props.children`
  var item;

  // iterate through the `children`
  for (var i = 0, len = arr.length; i < len; i++) {
    // child can have mixed values: text, React element, or array
    item = arr[i];
    switch (item.constructor) {
      // text node
      case String:
        result.push(item);
        break;
      // React element
      case Object:
        result.push(objectToReactElement(item));
        break;
      // array (mixed values)
      case Array:
        result.push(arrayToReactChildren(item));
        break;
      default:
      // pass
    }
  }

  return result;
}
