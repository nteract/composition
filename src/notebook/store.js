import { createStore, applyMiddleware } from 'redux';
import { createEpicMiddleware, combineEpics } from 'redux-observable';
import { triggerModified, errorLogger } from './middlewares';
import rootReducer from './reducers';

import epics from './epics';

const rootEpic = combineEpics(...epics);

const middlewares = [
  createEpicMiddleware(rootEpic),
  errorLogger,
  triggerModified,
];

export default function configureStore(initialState) {
  return createStore(
    rootReducer,
    initialState,
    applyMiddleware(...middlewares)
  );
}
