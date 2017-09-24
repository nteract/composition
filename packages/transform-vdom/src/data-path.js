const _ = require("lodash");
const DATA_PATH_PREFIX = "data-path-for-";
const DATA_PATH_FOR_CHILDREN = "data-path-for-children";

// Given a collection of attributes and a model that (hopefully) contains
// those paths, return a new collection of attributes replaces them according
// to the model.
function modelReplaceAttributes(model, obj) {
  const changes = _.reduce(
    obj.attributes,
    (result, value, key) => {
      if (key.startsWith(DATA_PATH_PREFIX)) {
        const changeKey = key.slice(DATA_PATH_PREFIX.length);
        const path = value;
        if (changeKey.length > 0) {
          result[changeKey] = _.get(model, path);
        }
      }
      return result;
    },
    {}
  );

  return changes;

  const attributes = Object.assign({}, changes, obj.attributes);
  let children = obj.children;

  // Special case children & data- attributes
  if (obj.attributes[DATA_PATH_FOR_CHILDREN]) {
    children = _.get(model, obj.attributes[DATA_PATH_FOR_CHILDREN]);
  }

  return Object.assign({}, { children, attributes }, obj);
}

/**

var attributes = {
    'data-path-for-value': 'what',
    'data-path-meh': 12,
    'data-path-for-children': 'mine',
    'value': 3
}

model = {
    'what': 40,
    'mine': "Hear ye, hear ye"
}

modelReplaceAttributes(model, { attributes: attributes, children: null })



 */
