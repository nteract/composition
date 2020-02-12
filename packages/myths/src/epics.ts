import { ActionsObservable, combineEpics, Epic, ofType, StateObservable } from "redux-observable";
import { EMPTY, of } from "rxjs";
import { filter, map, mergeMap, switchMap, withLatestFrom } from "rxjs/operators";
import { EpicDefinition, Myth, MythicAction, Myths, RootState } from "./types";

export const makeEpics = <
  PKG extends string,
  NAME extends string,
  STATE,
  PROPS,
>(
  pkg: PKG,
  type: string,
  create: (payload: PROPS) => MythicAction<PKG, NAME, PROPS>,
  definitions: Array<EpicDefinition<STATE, PROPS>>,
) => {
  const epics: Epic[] = [];

  for (const definition of definitions ?? []) {
    const mapper = definition.switchToMostRecent
      ? switchMap
      : mergeMap;

    const action = definition.dispatch === "self"
      ? (x: any) => of(create(x))
      : definition.dispatch
        ? (x: any) => of((definition.dispatch as Myth).create(x))
        : () => EMPTY;

    epics.push(
      (
        action$: ActionsObservable<MythicAction>,
        state$: StateObservable<RootState<PKG, STATE>>,
      ) =>
        action$.pipe(
          definition.onAction === "self"
            ? ofType(type)
            : filter(definition.onAction),
          withLatestFrom(state$.pipe(map(state => state.__private__[pkg]))),
          mapper(definition.from ?? (_ => of(null))),
          mapper(props => props !== undefined ? action(props) : EMPTY),
        )
    );
  }

  return epics;
};

export const makeMakeRootEpic = <PKG extends string, STATE>(
  myths: Myths<PKG, STATE>,
) =>
  () =>
    combineEpics(
      ...Object.values(myths).map(myth => combineEpics(...myth.epics))
    );
