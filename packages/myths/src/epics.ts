import { combineEpics, Epic } from "redux-observable";
import { EMPTY, Observable, of } from "rxjs";
import { filter, map, mergeMap } from "rxjs/operators";
import { CreateEpicDefinition, EpicDefinition, MythicAction, Myths } from "./types";

export const makeEpics = <
  PKG extends string,
  NAME extends string,
  STATE,
  PROPS,
>(
  create: (payload: PROPS) => MythicAction<PKG, NAME, PROPS>,
  definitions: Array<EpicDefinition<PROPS>>,
) => {
  const epics: Epic[] = [];

  for (const definition of definitions ?? []) {
    if ("create" in definition) {
      const def: CreateEpicDefinition<PROPS> = definition;

      epics.push(
        (action$: Observable<MythicAction>) =>
          action$.pipe(
            filter(def.on),
            map(def.create),
            mergeMap(props => props ? of(create(props)) : EMPTY),
          )
      );
    }
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
