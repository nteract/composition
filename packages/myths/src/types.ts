import { RecordOf } from "immutable";
import { ComponentClass } from "react";
import { ConnectedComponent } from "react-redux";
import { Action, Dispatch, Reducer } from "redux";
import { Epic } from "redux-observable";
import { Observable } from "rxjs";
import { Diff } from "utility-types";

export interface Myths<PKG extends string, STATE> {
  [key: string]: Myth<PKG, string, any, STATE>
}

export interface MythicAction<
  PKG extends string = string,
  NAME extends string = string,
  PROPS = any,
> extends Action {
  type: string;
  payload: PROPS;
  error?: boolean;
}

export type ConnectedComponentProps<
  MYTH_NAME extends string,
  MYTH_PROPS,
  ADDITIONAL_PROPS,
> = {
  [key in MYTH_NAME]: (payload: MYTH_PROPS) => void;
} & {
  dispatch: Dispatch;
} & ADDITIONAL_PROPS;

export interface Myth<
  PKG extends string = string,
  NAME extends string = string,
  PROPS extends {} = any,
  STATE = any,
> {
  pkg: PKG,
  name: NAME,
  type: string,
  epics: Epic[],

  // The following are all undefined, but can be used in typeof expressions
  props: PROPS,
  state: STATE,
  action: MythicAction<PKG, NAME, PROPS>,

  // Create an action of this Myth
  create: (payload: PROPS) => MythicAction<PKG, NAME, PROPS>,

  // Create a function that create actions of this Myth; props partially set
  with:
    <DEFINED_PROPS extends Partial<PROPS>>
    (partial: DEFINED_PROPS & Partial<PROPS>) =>
      (payload: Diff<PROPS, DEFINED_PROPS>) =>
        MythicAction<PKG, NAME, PROPS>

  // Is this one of our actions?
  appliesTo: (action: Action) => boolean,

  // Determine the successor state, action can be any
  reduce?: (state: RecordOf<STATE>, action: Action) => RecordOf<STATE>,

  // Build a component that can emit actions of this Myth
  createConnectedComponent: <COMPONENT_NAME extends string, COMPONENT_PROPS>(
    componentName: COMPONENT_NAME,
    cls: ComponentClass<ConnectedComponentProps<NAME, PROPS, COMPONENT_PROPS>>,
    makeState?: (state: any, props: COMPONENT_PROPS) => Partial<COMPONENT_PROPS>,
  ) => ConnectedComponent<ComponentClass<COMPONENT_PROPS>, COMPONENT_PROPS>;
}

export interface RootState<PKG extends string, STATE> {
  __private__: {
    [key in PKG]: RecordOf<STATE>;
  };
}

export interface MaybeRootState<PKG extends string, STATE> {
  __private__?: {
    [key in PKG]?: RecordOf<STATE>;
  };
}

export type Selector<STATE, T> = (state?: STATE) => T;

export interface MythicPackage<
  PKG extends string = string,
  STATE = any
> {
  name: PKG;
  myths: Myths<PKG, STATE>;

  // The following is undefined, but can be used in typeof expressions
  state: STATE;

  initialState: RecordOf<STATE>;

  makeStateRecord: (state: STATE) => RecordOf<STATE>,
  makeRootEpic: () => Epic;
  rootReducer: Reducer<RecordOf<STATE>, MythicAction>;
  createMyth: <NAME extends string>(name: NAME) =>
    <PROPS>(definition: MythDefinition<STATE, PROPS>) =>
      Myth<PKG, NAME, PROPS, STATE>;
  createSelector:
    <T>(selector: Selector<STATE, T>) =>
      (state?: MaybeRootState<PKG, STATE>) => T | undefined

  testMarbles: (
    inputMarbles: string,
    outputMarbles: string,
    marblesMapToActions: { [key: string]: MythicAction },
    state?: STATE,
  ) => void;
}

export type ReducerDefinition<STATE, PROPS> = (
  state: RecordOf<STATE>,
  action: MythicAction<string, string, PROPS>,
) => RecordOf<STATE> | void;

export interface MythDefinition<STATE, PROPS> {
  reduce?: ReducerDefinition<STATE, PROPS>;
  thenDispatch?: Array<EpicFuncDefinition<STATE, PROPS, MythicAction>>;
  andAlso?: Array<EpicWhenFuncDefinition<STATE, PROPS, MythicAction>>;
}

export type EpicFuncDefinition<STATE, PROPS, RESULT> =
  (
    action: MythicAction<string, string, PROPS>,
    state: RecordOf<STATE>,
    myth: Myth<string, string, PROPS>,
  ) => Observable<RESULT>;

export interface EpicWhenFuncDefinition<STATE, PROPS, RESULT> {
  when: (action: MythicAction<string, string, PROPS>) => boolean;
  dispatch: EpicFuncDefinition<STATE, PROPS, RESULT>;
}

export interface PackageDefinition<STATE> {
  initialState: STATE;
}
