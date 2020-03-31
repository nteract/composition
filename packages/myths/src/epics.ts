import { combineEpics, Epic, ofType, StateObservable } from "redux-observable";
import { EMPTY, Observable } from "rxjs";
import { filter, map, mergeMap, withLatestFrom } from "rxjs/operators";
import { EpicFuncDefinition, Myth, MythDefinition, MythicAction, Myths, RootState } from "./types";

const makeEpic = <
  PKG extends string,
  NAME extends string,
  STATE,
  PROPS,
>(
  pkg: PKG,
  myth: Myth<PKG, NAME, PROPS, STATE>,
  dispatch: EpicFuncDefinition<STATE, PROPS, MythicAction>,
  narrow: (source: Observable<MythicAction>) => Observable<MythicAction>
) =>
    (
      action$: Observable<MythicAction>,
      state$: StateObservable<RootState<PKG, STATE>>,
    ) =>
      action$.pipe(
        narrow,
        withLatestFrom(state$.pipe(map(state => state.__private__[pkg]))),
        mergeMap(([action, state]) => dispatch(action, state, myth) ?? EMPTY),
      );

export const makeEpics = <
  PKG extends string,
  NAME extends string,
  STATE,
  PROPS,
>(
  pkg: PKG,
  myth: Myth<PKG, NAME, PROPS, STATE>,
  definition: MythDefinition<STATE, PROPS>,
) => {
  const epics: Epic[] = [];

  for (const { when, dispatch } of definition.andAlso ?? []) {
    epics.push(makeEpic(pkg, myth, dispatch, filter(when)));
  }

  for (const dispatch of definition.thenDispatch ?? []) {
    epics.push(makeEpic(pkg, myth, dispatch, ofType(myth.type)));
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
