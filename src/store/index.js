import {
  createStore,
  applyMiddleware,
  compose
} from 'redux';
import createSagaMiddleware from 'redux-saga';

import rootReducer from '../reducers';

import {
  cleanupKernel,
  executeCell,
  newKernel,
  save,
  saveAs,
  setNotebook
} from '../sagas';

const sagas = [
  cleanupKernel,
  executeCell,
  newKernel,
  save,
  saveAs,
  setNotebook
];

export default (launchData) => createStore(
  rootReducer(launchData),
  applyMiddleware(createSagaMiddleware(...sagas))
);
