import { combineReducers, Store } from "redux";

import { ConfigurationState, epic, reducer } from "../../common/config";
import configureStore from "../../common/store";
import { DEFAULT_STATE } from "./state";

export type PreferencesStore = Store<ConfigurationState>;

export const configurePreferencesStore = () =>
  configureStore(
    DEFAULT_STATE,
    combineReducers({config: reducer}),
    [epic],
  );
