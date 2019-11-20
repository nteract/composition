import { middlewares as coreMiddlewares } from "@nteract/core";
import { Action, applyMiddleware, createStore, DeepPartial, Middleware, Reducer, Store } from "redux";
import { ActionsObservable, combineEpics, createEpicMiddleware, Epic, StateObservable } from "redux-observable";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";

export default function configureStore<S, A extends Action>(
  initialState: DeepPartial<S>,
  reducer: Reducer<S, A>,
  epics: Array<Epic<A, A, S>>,
): Store<S, A> {
  const epicMiddleware = createEpicMiddleware<A, A, S>();
  const middlewares = [
    epicMiddleware,
    coreMiddlewares.errorMiddleware,
    process.env.DEBUG === "true" ? coreMiddlewares.logger() : null,
  ].filter(x => x !== null) as Middleware[];
  const store = createStore(
    reducer,
    initialState,
    applyMiddleware(...middlewares),
  );

  epicMiddleware.run(
    (
      action$: ActionsObservable<any>,
      store$: StateObservable<any>,
      dependencies: any,
    ) =>
      combineEpics(...epics)(action$, store$, dependencies).pipe(
        catchError((error: any, source: Observable<any>) => {
          console.error(error);
          return source;
        })
      )
  );

  return store;
}
