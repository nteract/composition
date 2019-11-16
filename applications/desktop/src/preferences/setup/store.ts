import { Reducer, Store } from "redux";

import configureStore from "../../common/store";
import { ConfigInterfaceAction, epic, reducer } from "../../common/use-cases";
import { DEFAULT_STATE, PreferencesAppState } from "./state";

export type PreferencesStore =
  Store<PreferencesAppState, ConfigInterfaceAction>;

export const configurePreferencesStore = () =>
  configureStore(
    DEFAULT_STATE,
    { config: reducer as Reducer<any, any> },
    [epic],
  );
