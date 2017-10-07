/* @flow */

/**
 * The original copy of this comes from
 * https://github.com/remarkablemark/REON/blob/1f126e71c17f96daad518abffdb2c53b66b8b792/lib/object-to-react.js
 *
 * This version is heavily modified to:
 *
 *   * Match the application/vdom.v1+json spec
 *   * Not mutate data
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

type VDOMEl = {
  tagName: string, // Could be an enum honestly
  children: VDOMNode,
  attributes: Object,
  key: number | string | null
};

type ReactArray = Array<React$Element<*> | ReactArray | string>;

type VDOMNode = VDOMEl | string | Array<VDOMNode>;

/**
 * Convert an object to React element(s).
 *
 * The object schema should be similar to React element's.
 * Note: The object passed in this function will be mutated.
 *
 * @param  {Object}       obj - The element object.
 * @return {ReactElement}
 */
export function objectToReactElement(obj: VDOMEl): React$Element<*> {
  // Pack args for React.createElement
  var args = [];

  if (!obj.tagName || typeof obj.tagName !== "string") {
    throw new Error(`Invalid tagName on ${JSON.stringify(obj, null, 2)}`);
  }
  if (
    !obj.attributes ||
    Array.isArray(obj.attributes) ||
    typeof obj.attributes !== "object"
  ) {
    throw new Error(`Attributes must exist on a VDOM Object as an object`);
  }

  // style must be an object (non-array)
  if (obj.attributes.style === null || obj.attributes.style === undefined) {
    // no worries here, style can be null or undefined, note that we don't want
    // the falsy values to sneak through (NaN, "", 0, false)
  } else if (
    Array.isArray(obj.attributes.style) ||
    typeof obj.attributes.style !== "object"
  ) {
    throw new Error(
      `Style attribute must be an object like { 'backgroundColor': 'DeepPink' }`
    );
  }

  // `React.createElement` 1st argument: type
  args[0] = obj.tagName;
  args[1] = obj.attributes;

  const children = obj.children;

  if (children) {
    if (Array.isArray(children)) {
      // to be safe (although this should never happen)
      if (args[1] === undefined) {
        args[1] = null;
      }
      args = args.concat(arrayToReactChildren(children));
    } else if (typeof children === "string") {
      args[2] = children;
    } else if (typeof children === "object") {
      args[2] = objectToReactElement(children);
    } else {
      throw new Error(
        "children of a vdom element must be a string, object, null, or array of vdom nodes"
      );
    }
  }

  // $FlowFixMe: React
  return React.createElement.apply({}, args);
}

/**
 * Convert an array of items to React children.
 *
 * @param  {Array} arr - The array.
 * @return {Array}     - The array of mixed values.
 */
export function arrayToReactChildren(arr: Array<VDOMNode>): ReactArray {
  var result = [];

  // iterate through the `children`
  for (var i = 0, len = arr.length; i < len; i++) {
    // child can have mixed values: text, React element, or array
    const item = arr[i];
    if (item === null) {
      continue;
    } else if (Array.isArray(item)) {
      result.push(arrayToReactChildren(item));
    } else if (typeof item === "string") {
      result.push(item);
    } else if (typeof item === "object") {
      // Create a new object so that if we have to set the key, we are not
      // mutating the original object
      const keyedItem = {
        tagName: item.tagName,
        attributes: item.attributes,
        children: item.children,
        key: i
      };
      if (item.attributes && item.attributes.key) {
        keyedItem.key = item.attributes.key;
      }
      result.push(objectToReactElement(keyedItem));
    } else {
      throw new Error(`invalid vdom child: "${item}"`);
    }
  }

  return result;
}
