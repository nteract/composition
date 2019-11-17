import { combineReducers, Store } from "redux";

import { Configuration, epic, reducer } from "../../common/config";
import configureStore from "../../common/store";
import { DEFAULT_STATE } from "./state";

export type PreferencesStore = Store<{config: Configuration}>;

export const configurePreferencesStore = () =>
  configureStore(
    DEFAULT_STATE,
    combineReducers({config: reducer}),
    [epic],
  );
