// @flow
import {
  makeKernelRecordForType,
  makeKernelsRecord
} from "../../../state/entities/kernels";

import {
  makeKernelInfoRecord,
  makeHelpLinkRecord
} from "../../../state/entities/kernel-info";

import * as actionTypes from "../../../actionTypes";
import { combineReducers } from "redux-immutable";
import * as Immutable from "immutable";

// TODO: we need to clean up references to old kernels at some point. Listening
// for KILL_KERNEL_SUCCESSFUL seems like a good candidate, but I think you can
// also end up with a dead kernel if that fails and you hit KILL_KERNEL_FAILED.
const byRef = (
  state = Immutable.Map(),
  action:
    | actionTypes.SetLanguageInfo
    | actionTypes.RestartKernel
    | actionTypes.KillKernelSuccessful
    | actionTypes.KillKernelFailed
    | actionTypes.NewKernelAction
    | actionTypes.LaunchKernelAction
    | actionTypes.LaunchKernelByNameAction
    | actionTypes.ChangeKernelByName
    | actionTypes.SetExecutionStateAction
    | actionTypes.SetKernelInfo
) => {
  switch (action.type) {
    case actionTypes.SET_LANGUAGE_INFO:
      // TODO: Should the kernel hold language info?
      return state;
    case actionTypes.KILL_KERNEL_SUCCESSFUL:
      return state.setIn([action.payload.kernelRef, "status"], "killed");
    case actionTypes.KILL_KERNEL_FAILED:
      return state.setIn(
        [action.payload.kernelRef, "status"],
        "failed to kill"
      );
    case actionTypes.RESTART_KERNEL:
      return state.setIn([action.payload.kernelRef, "status"], "restarting");
    case actionTypes.LAUNCH_KERNEL:
      const launchAction = (action: actionTypes.LaunchKernelAction);
      return state.update(
        launchAction.payload.kernelRef,
        (rec = makeKernelRecordForType(launchAction.payload.kernelType)) =>
          // $FlowFixMe: Flow is incorrectly typing `rec`, triggering: "Cannot call rec.merge because: property merge is missing in LocalKernelProps ... property merge is missing in RemoteKernelProps."
          rec.merge({
            status: "launching",
            kernelSpecName: launchAction.payload.kernelSpec.name
          })
      );
    case actionTypes.LAUNCH_KERNEL_BY_NAME:
      const launchByNameAction = (action: actionTypes.LaunchKernelByNameAction);
      return state.update(
        launchByNameAction.payload.kernelRef,
        (
          rec = makeKernelRecordForType(launchByNameAction.payload.kernelType)
        ) =>
          // $FlowFixMe: Same issue w/ incorrect typing of `rec` as above.
          rec.merge({
            status: "launching",
            kernelSpecName: launchByNameAction.payload.kernelSpecName
          })
      );
    case actionTypes.CHANGE_KERNEL_BY_NAME:
      return state.setIn([action.payload.oldKernelRef, "status"], "changing");
    case actionTypes.SET_KERNEL_INFO:
      let codemirrorMode = action.payload.info.codemirrorMode;
      // If the codemirror mode isn't set, fallback on the language name
      if (!codemirrorMode) {
        codemirrorMode = action.payload.info.languageName;
      }
      switch (typeof codemirrorMode) {
        case "string":
          // already set as we want it
          break;
        case "object":
          codemirrorMode = Immutable.Map(codemirrorMode);
          break;
        default:
          // any other case results in falling back to language name
          codemirrorMode = action.payload.info.languageName;
      }

      const helpLinks = action.payload.info.helpLinks
        ? Immutable.List(action.payload.info.helpLinks.map(makeHelpLinkRecord))
        : Immutable.List();

      return state.setIn(
        [action.payload.kernelRef, "info"],
        makeKernelInfoRecord(action.payload.info).merge({
          helpLinks,
          codemirrorMode
        })
      );
    case actionTypes.SET_EXECUTION_STATE:
      return state.setIn(
        [action.payload.kernelRef, "status"],
        action.payload.kernelStatus
      );
    case actionTypes.LAUNCH_KERNEL_SUCCESSFUL:
      const successAction = (action: actionTypes.NewKernelAction);
      return state.update(
        successAction.payload.kernelRef,
        (rec = makeKernelRecordForType(successAction.payload.kernel.type)) =>
          // $FlowFixMe: Same issue w/ incorrect typing of `rec` as above.
          rec.merge(successAction.payload.kernel)
      );
    default:
      return state;
  }
};

export const kernels = combineReducers({ byRef }, makeKernelsRecord);
