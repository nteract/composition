import Immutable from 'immutable';

const _ = require('lodash');

// Fallback model reducer that returns pure change objects
const justChanges = (model, change) => change;

const modelReducers = {
  // stream and direct are aliases of each other
  stream: justChanges,
  direct: justChanges,
  'object-assign': (model, change) => Object.assign({}, model, change),
  'immutable-merge': (model, change) => model.merge(Immutable.fromJS(change)),
  'lodash-merge': (model, change) => _.merge({}, model, change),
};

const justInit = (data) => data;
const modelInit = {
  stream: justInit,
  direct: justInit,
  'object-assign': justInit,
  'immutable-merge': (data) => Immutable.fromJS(data),
  'lodash-merge': justInit,
};

const fallback = {
  get: (target, name) =>
    // NOTE: We could throw a specialized error
    ({}.hasOwnProperty.call(target, name) ? target[name] : justChanges)
};


// We return all our reducers + a fallback
const reducers = new Proxy(modelReducers, fallback);

export const targetName = 'pure-model';
export const targetModules = reducers;
export const targetModulesInit = modelInit;
