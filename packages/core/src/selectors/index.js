// @flow
import type { AppState } from "@nteract/types/core/records";
import { toJS, stringifyNotebook } from "@nteract/commutable";
import * as Immutable from "immutable";
import { createSelector } from "reselect";

const identity = thing => thing;
const serverUrl = (state: AppState) => state.app.host.serverUrl;
const crossDomain = (state: AppState) => state.app.host.crossDomain;
const token = (state: AppState) => state.app.host.token;

export const serverConfig = createSelector(
  [serverUrl, crossDomain, token],
  (serverUrl, crossDomain, token) => ({
    endpoint: serverUrl,
    crossDomain,
    token
  })
);

export const userPreferences = createSelector(
  (state: AppState) => state.config,
  config => config.toJS()
);

export const appVersion = createSelector(
  (state: AppState) => state.app.version,
  identity
);

// Quick memoized host and kernel selection.
//
// Intended to be useful for a core app and be future proof for when we have
// both refs and selected/current hosts and kernels
export const currentHost = createSelector(
  (state: AppState) => state.app.host,
  identity
);

export const currentKernel = createSelector(
  (state: AppState) => state.app.kernel,
  identity
);

export const currentKernelType = createSelector([currentKernel], kernel => {
  if (kernel && kernel.type) {
    return kernel.type;
  }
  return null;
});

export const currentKernelStatus = createSelector([currentKernel], kernel => {
  if (kernel && kernel.status) {
    return kernel.status;
  }
  return "not connected";
});

export const currentHostType = createSelector([currentHost], host => {
  if (host && host.type) {
    return host.type;
  }
  return null;
});

export const isCurrentKernelZeroMQ = createSelector(
  [currentHostType, currentKernelType],
  (hostType, kernelType) => {
    return hostType === "local" && kernelType === "zeromq";
  }
);

export const isCurrentHostJupyter = createSelector(
  [currentHostType],
  hostType => hostType === "jupyter"
);

export const isCurrentKernelJupyterWebsocket = createSelector(
  [currentHostType, currentKernelType],
  (hostType, kernelType) => {
    return hostType === "jupyter" && kernelType === "websocket";
  }
);

export const comms = createSelector((state: AppState) => state.comms, identity);

export const models = createSelector([comms], comms => comms.get("models"));

// TODO: if we're not looking at a notebook in the UI, there may not _be_ a
// notebook object to get. Do we return null? Throw an error?
export const currentNotebook = createSelector(
  (state: AppState) => state.document.get("notebook", null),
  identity
);

export const currentSavedNotebook = createSelector(
  (state: AppState) => state.document.get("savedNotebook"),
  identity
);

export const currentStickyCells = createSelector(
  (state: AppState) => state.document.get("stickyCells"),
  identity
);

export const currentLastSaved = createSelector(
  (state: AppState) => state.app.get("lastSaved"),
  identity
);

export const currentNotebookMetadata = createSelector(
  (state: AppState) =>
    state.document.getIn(["notebook", "metadata"], Immutable.Map()),
  identity
);

const CODE_MIRROR_MODE_DEFAULT = "text";
export const codeMirrorMode = createSelector(
  [currentNotebookMetadata],
  metadata =>
    metadata.getIn(["language_info", "codemirror_mode"]) ||
    metadata.getIn(["kernel_info", "language"]) ||
    metadata.getIn(["kernelspec", "language"]) ||
    CODE_MIRROR_MODE_DEFAULT
);

export const currentDisplayName = createSelector(
  [currentNotebookMetadata],
  metadata => metadata.getIn(["kernelspec", "display_name"], "")
);

export const currentNotebookGithubUsername = createSelector(
  [currentNotebookMetadata],
  metadata => metadata.get("github_username", null)
);

export const currentNotebookGistId = createSelector(
  [currentNotebookMetadata],
  metadata => metadata.get("gist_id", null)
);

export const currentNotebookJS = createSelector([currentNotebook], notebook => {
  if (notebook) {
    return toJS(notebook);
  }
  return null;
});

export const currentNotebookString = createSelector(
  [currentNotebookJS],
  notebookJS => {
    if (notebookJS) {
      return stringifyNotebook(notebookJS);
    }
    return "";
  }
);

export const currentFocusedCellId = createSelector(
  (state: AppState) => state.document.get("cellFocused"),
  identity
);

export const currentFocusedEditorId = createSelector(
  (state: AppState) => state.document.get("editorFocused"),
  identity
);

export const transientCellMap = createSelector(
  (state: AppState) =>
    state.document.getIn(["transient", "cellMap"], Immutable.Map()),
  identity
);

export const currentCellMap = createSelector([currentNotebook], notebook => {
  if (notebook) {
    return notebook.get("cellMap");
  }
  return null;
});

export const currentCellOrder = createSelector([currentNotebook], notebook => {
  if (notebook) {
    return notebook.get("cellOrder");
  }
  return null;
});

export const currentCodeCellIds = createSelector(
  [currentCellMap, currentCellOrder],
  (cellMap, cellOrder) => {
    if (cellMap && cellOrder) {
      return cellOrder.filter(
        id => cellMap.getIn([id, "cell_type"]) === "code"
      );
    }
    return Immutable.List();
  }
);

export const currentCodeCellIdsBelow = createSelector(
  [currentFocusedCellId, currentCellMap, currentCellOrder],
  (focusedCellId, cellMap, cellOrder) => {
    if (cellMap && cellOrder) {
      const index = cellOrder.indexOf(focusedCellId);
      return cellOrder
        .skip(index)
        .filter(id => cellMap.getIn([id, "cell_type"]) === "code");
    }
    return Immutable.List();
  }
);

export const currentHiddenCellIds = createSelector(
  [currentCellMap, currentCellOrder],
  (cellMap, cellOrder) => {
    if (cellMap && cellOrder) {
      return cellOrder.filter(id =>
        cellMap.getIn([id, "metadata", "inputHidden"])
      );
    }
    return null;
  }
);

export const currentFilename = createSelector(
  (state: AppState) => state.document.get("filename"),
  identity
);

export const modalType = createSelector(
  (state: AppState) => state.modals.modalType,
  identity
);
