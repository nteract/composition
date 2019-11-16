import { epics, reducers } from "@nteract/core";
import { Reducer, Store } from "redux";

import {
  loadConfigEpic,
  saveConfigEpic,
  saveConfigOnChangeEpic
} from "../../common/epics/config";
import configureStore from "../../common/store";
import { DEFAULT_STATE, PreferencesAppState } from "./state";

export interface Actions {
  type: string;
  payload?: any;
  error?: boolean;
}

export type PreferencesStore = Store<PreferencesAppState, Actions>;

export const configurePreferencesStore = () =>
  configureStore(
    DEFAULT_STATE,
    { config: reducers.config as Reducer<any, any> },
    [loadConfigEpic, saveConfigEpic, saveConfigOnChangeEpic],
  );
