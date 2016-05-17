import * as Rx from 'rxjs/Rx';
import { mark, measure } from '../performance';

export default function createStore(initialState, reducers) {
  const subject = new Rx.Subject();

  const store = subject.scan(
    (state, action) => {
      if (!action || !action.type || ! (action.type in reducers)) {
        console.error('Action not registered');
        console.error(action);
        console.error(action.type);
        return state; // no reduction
      }

      // Do not allow reducers to fail silently!  console.error errors as they
      // happen.
      try {
        mark(`${action.type}:enter`);
        return reducers[action.type].call(null, state, action);
      } catch (error) {
        console.error(error);
        throw error;
      } finally {
        mark(`${action.type}:exit`);
        measure(action.type, `${action.type}:enter`, `${action.type}:exit`);
      }
    },
    initialState || {}
  ).share();

  const stateSymbol = Symbol('state');
  store.subscribe(state => {
    store[stateSymbol] = state;
  }, (err) => {
    console.error('Error in the store', err);
  });
  store[stateSymbol] = initialState;
  store.getState = () => store[stateSymbol];

  function dispatch(action) {
    return typeof action === 'function'
      ? action.call(null, subject, dispatch)
      : subject.next(action);
  }

  return {
    store,
    dispatch,
  };
}
