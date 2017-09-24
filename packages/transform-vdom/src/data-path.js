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

  const childrenChanges = {};

  // If there are any changes to children, they belong at the top level,
  // so we ensure they don't end up at the attribute level
  if (changes["children"]) {
    childrenChanges["children"] = changes["children"];
    delete changes["children"];
  }

  return Object.assign({}, obj, childrenChanges, { attributes: changes });
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
