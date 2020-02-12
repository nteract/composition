import { applyMiddleware, combineReducers, createStore, Middleware, ReducersMapObject, Store } from "redux";
import { ActionsObservable, combineEpics, createEpicMiddleware, Epic, StateObservable } from "redux-observable";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";
import { MythicAction, MythicPackage } from "./types";

export const makeConfigureStore = <STATE>() => <DEPS>(
  definition: {
    packages: MythicPackage[],
    reducers?: ReducersMapObject<Omit<STATE, "__private__">, any>
    epics?: Epic[],
    epicMiddleware?: Middleware[],
    epicDependencies?: DEPS,
    enhancer?: (enhancer: any) => any,
  }
) => {
  const rootReducer = combineReducers(
    Object.assign(
      definition.reducers ?? {},
      {
        __private__: combineReducers(
          definition.packages
            .map(pkg => ({ [pkg.name]: pkg.rootReducer }))
            .reduce(Object.assign, {})
        ),
      },
    ),
  );

  const epicMiddleware = createEpicMiddleware<any, any, STATE, any>({
    dependencies: definition.epicDependencies ?? {},
  });

  const rootEpic = (
    action$: ActionsObservable<any>,
    store$: StateObservable<any>,
    dependencies: any,
  ) =>
    combineEpics(
      ...(definition.epics ?? []),
      ...definition.packages
        .map(pkg => pkg.makeRootEpic()),
    )(action$, store$, dependencies).pipe(
      catchError((error: any, source: Observable<any>) => {
        console.error(error);
        return source;
      })
    );

  return (initialState: Partial<STATE>): Store<STATE, MythicAction> => {
    const baseEnhancer = applyMiddleware(
      epicMiddleware,
      ...(definition.epicMiddleware ?? []),
    );
    const store = createStore(
      rootReducer,
      (initialState as unknown) as any,
      definition.enhancer
        ? definition.enhancer(baseEnhancer)
        : baseEnhancer,
    );
    epicMiddleware.run(rootEpic);

    return store as any;
  };
};
