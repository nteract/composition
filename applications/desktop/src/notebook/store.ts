import { reducers } from "@nteract/core";
import { Reducer, Store } from "redux";

import commonConfigureStore from "../common/store";
import { epic as configEpic, reducer as configReducer } from "../common/use-cases";
import { Actions } from "./actions";
import epics from "./epics";
import { handleDesktopNotebook } from "./reducers";
import { DesktopNotebookAppState } from "./state";

export type DesktopStore = Store<DesktopNotebookAppState, Actions>;

export default function configureStore(
  initialState: Partial<DesktopNotebookAppState>
): DesktopStore {
  return commonConfigureStore(
    initialState as DesktopNotebookAppState,
    {
      app: reducers.app as Reducer<any, any>,
      comms: reducers.comms as Reducer<any, any>,
      config: configReducer as Reducer<any, any>,
      core: reducers.core as Reducer<any, any>,
      desktopNotebook: handleDesktopNotebook as Reducer<any, any>,
    },
    [configEpic, ...epics],
  );
}
