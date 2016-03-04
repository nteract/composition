import {
  createStore,
  applyMiddleware,
  compose
} from 'redux';
import createSagaMiddleware from 'redux-saga';
import logger from 'redux-logger'

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
  applyMiddleware(createSagaMiddleware(...sagas), logger({
    stateTransformer: state => state.toJS(),
    errorTransformer: error => {
      console.log(error);
      return error;
    }
  }))
);
