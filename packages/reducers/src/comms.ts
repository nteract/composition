import * as Immutable from "immutable";

import {
  CommMessageAction,
  CommOpenAction,
  RegisterCommTargetAction
} from "@nteract/actions";
import { CommsRecord, makeCommsRecord } from "@nteract/types";

function registerCommTarget(
  state: CommsRecord,
  action: RegisterCommTargetAction
): CommsRecord {
  return state.setIn(["targets", action.name], action.handler);
}

function processCommOpen(
  state: CommsRecord,
  action: CommOpenAction
): CommsRecord {
  const { target_name, target_module, data, comm_id } = action;

  const commInfo = {
    target_module,
    target_name
  };

  return state
    .setIn(["info", comm_id], Immutable.fromJS(commInfo))
    .setIn(["models", comm_id], Immutable.fromJS(data));
}

function processCommMessage(
  state: CommsRecord,
  action: CommMessageAction
): CommsRecord {
  const { data, comm_id } = action;

  const commInfo = state.info.get(comm_id);
  if (
    commInfo &&
    commInfo.get("target_module") === "reducers" &&
    commInfo.get("target_name") === "setIn"
  ) {
    const path: Array<string | number> = data.path;
    const value = Immutable.fromJS(data.value);

    // set `value` into `path` of the model data
    return state.updateIn(["models", comm_id], model =>
      model.setIn(path, value)
    );
  }

  // Default to overwrite / replace for now
  return state.setIn(["models", comm_id], Immutable.fromJS(data));
}

type CommAction = RegisterCommTargetAction | CommMessageAction | CommOpenAction;

export default function(
  state: CommsRecord = makeCommsRecord(),
  action: CommAction
) {
  switch (action.type) {
    case "REGISTER_COMM_TARGET":
      return registerCommTarget(state, action);
    case "COMM_OPEN":
      return processCommOpen(state, action);
    case "COMM_MESSAGE":
      return processCommMessage(state, action);
    default:
      return state;
  }
}
