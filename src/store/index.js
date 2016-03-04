import {
  createStore,
  applyMiddleware,
  compose
} from 'redux';
import rootReducer from '../reducers';
import createSagaMiddleware from 'redux-saga';

export default (launchData) => createStore(
  rootReducer(launchData),
  applyMiddleware(createSagaMiddleware())
);
