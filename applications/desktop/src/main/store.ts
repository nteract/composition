import { Kernelspecs, middlewares as coreMiddlewares } from "@nteract/core";
import { configuration } from "@nteract/mythic-configuration";
import { makeConfigureStore } from "@nteract/myths";
import { AnyAction } from "redux";
import { QUITTING_STATE_NOT_STARTED, QuittingState } from "./actions";
import { MainStateProps } from "./reducers";

export const configureStore = makeConfigureStore<MainStateProps>()({
  packages: [
    configuration,
  ],
  reducers: {
    kernelSpecs: (state: Kernelspecs = {}, action: AnyAction) =>
      action.type === "SET_KERNELSPECS" ? action.payload.kernelSpecs : state,
    quittingState: (
      state: QuittingState = QUITTING_STATE_NOT_STARTED, action: AnyAction
    ) =>
      action.type === "SET_QUITTING_STATE" ? action.payload.newState : state,
  },
  epicMiddleware:
    process.env.DEBUG === "true"
      ? [coreMiddlewares.logger()]
      : [],
});
export default configureStore;
