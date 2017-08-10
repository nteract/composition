/* @flow */
import * as Immutable from "immutable";

type MetadataState = Immutable.Map<string, any>;
const defaultMetadataState: MetadataState = new Immutable.Map({
  filename: null
});

type ChangeFilenameAction = {
  type: "CHANGE_FILENAME" | "SET_NOTEBOOK",
  filename: string
};
function changeFilename(state: MetadataState, action: ChangeFilenameAction) {
  if (action.filename) {
    return state.set("filename", action.filename);
  }
  return state;
}

export default function(
  state: MetadataState = defaultMetadataState,
  action: ChangeFilenameAction
) {
  if (action.type === "CHANGE_FILENAME" || action.type === "SET_NOTEBOOK") {
    return changeFilename(state, action);
  }
  return state;
}
