import { Record } from "immutable";
import { StateObservable } from "redux-observable";
import { of, Subject } from "rxjs";
import { TestScheduler } from "rxjs/testing";
import { makeMakeRootEpic } from "./epics";
import { makeCreateMyth } from "./myth";
import { makeRootReducer } from "./reducer";
import { MythicAction, MythicPackage, Myths, PackageDefinition, RootState, Selector } from "./types";

export const createMythicPackage =
  <PKG extends string>(pkg: PKG) =>
    <STATE>(
      packageDefinition: PackageDefinition<STATE>,
    ): MythicPackage<PKG, STATE> => {
      type OurPackage = MythicPackage<PKG, STATE>;

      const myths: Myths<PKG, STATE> = {};

      const packageWIP: Partial<OurPackage> = {
        name: pkg,
        myths,

        // for use in typeof expressions:
        state: undefined as unknown as STATE,

        initialState: Record<STATE>(
          packageDefinition.initialState,
        )(),

        makeStateRecord: Record<STATE>(
          packageDefinition.initialState,
        ),

        makeRootEpic:
          makeMakeRootEpic(myths),

        rootReducer:
          makeRootReducer(myths, packageDefinition.initialState),

        createMyth:
          makeCreateMyth(pkg, myths),

        createSelector:
          <T>(selector: Selector<STATE, T>) =>
            (state: RootState<PKG, STATE>) => {
              const value = selector(state?.__private__?.[pkg]);
              return (value as any).toJS !== undefined
                ? (value as any).toJS()
                : value;
            },
      };

      packageWIP.testMarbles = (
        inputMarbles: string,
        outputMarbles: string,
        marblesMapToActions: { [key: string]: MythicAction },
        state?: STATE,
      ) => {
        const originalState = {
          __private__: {
            [packageWIP.name!]: state === undefined
              ? packageWIP.initialState
              : packageWIP.makeStateRecord!(state),
          },
        };

        new TestScheduler(
          (actual, expected) => expect(actual).toEqual(expected)
        ).run(helpers => {
          const { hot, expectObservable } = helpers;
          const inputAction$ = hot(inputMarbles, marblesMapToActions);
          const outputAction$ = packageWIP.makeRootEpic!()(
            inputAction$,
            new StateObservable(new Subject(), originalState),
            {},
          );

          expectObservable(outputAction$)
            .toBe(outputMarbles, marblesMapToActions);
        });
      };

      return packageWIP as OurPackage;
    };
