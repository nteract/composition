
export const targetName = 'nteract-models';

const justChanges = (model, change) => change;

export const targetModuleReducers = {
  // stream and direct are aliases of each other
  stream: justChanges,
  direct: justChanges,
  'object-assign': (model, change) => Object.assign({}, model, change),
  'immutable-merge': (model, change) => model.merge(Immutable.fromJS(change)),
  'lodash-merge': (model, change) => _.merge({}, model, change),
};
