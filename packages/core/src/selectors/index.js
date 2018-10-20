// @flow

import * as notebook from "./notebook";
import { createSelector } from "reselect";

import type {
  AppState,
  JupyterHostRecord,
  ContentRef,
  KernelRef,
  KernelspecsByRefRecord
} from "../state";

// Export sub-selectors (those that operate on contents models for instance)
export { notebook };

function identity<T>(thing: T): T {
  return thing;
}

export const serverConfig = (host: JupyterHostRecord) => {
  return {
    endpoint: host.origin + host.basePath,
    crossDomain: host.crossDomain,
    token: host.token
  };
};

export const userTheme = (state: AppState): string =>
  state.config.get("theme", "light");

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

export const contentByRef = (state: AppState) =>
  state.core.entities.contents.byRef;

export const content = (
  state: AppState,
  { contentRef }: { contentRef: ContentRef }
) => contentByRef(state).get(contentRef);

export const model = (
  state: AppState,
  { contentRef }: { contentRef: ContentRef }
) => {
  const content = contentByRef(state).get(contentRef);
  if (!content) {
    return null;
  }
  return content.model;
};

export const kernelRefByContentRef = (
  state: AppState,
  ownProps: { contentRef: ContentRef }
): ?KernelRef => {
  const c = content(state, ownProps);
  // TODO: When kernels can be associated on other content types, we'll
  //      allow those too. For now, because of how flow works we have to
  //      check the "type" field rather than try to check if `kernelRef` is
  //      a property of the model. There might be some way though. 🤔
  if (c && c.model && c.model.type === "notebook") {
    return c.model.kernelRef;
  }

  return null;
};

export const currentKernelspecsRef = (state: AppState) =>
  state.core.currentKernelspecsRef;

export const kernelspecsByRef = (state: AppState) =>
  state.core.entities.kernelspecs.byRef;

export const currentKernelspecs: (
  state: AppState
) => ?KernelspecsByRefRecord = createSelector(
  currentKernelspecsRef,
  kernelspecsByRef,
  (ref, byRef) => (ref ? byRef.get(ref) : null)
);

export const kernelsByRef = (state: AppState) =>
  state.core.entities.kernels.byRef;

export const kernel = (
  state: AppState,
  { kernelRef }: { kernelRef: KernelRef }
) => kernelsByRef(state).get(kernelRef);

export const currentKernelRef = (state: AppState) => state.core.kernelRef;

export const currentKernel = createSelector(
  currentKernelRef,
  kernelsByRef,
  (kernelRef, byRef) => (kernelRef ? byRef.get(kernelRef) : null)
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

// NOTE: These are comm models, not contents models
export const models = createSelector([comms], comms => comms.get("models"));

export const filepath = (
  state: *,
  ownProps: { contentRef: ContentRef }
): ?string => {
  const c = content(state, ownProps);
  if (!c) {
    return null;
  }
  return c.filepath;
};

export const modalType = createSelector(
  (state: AppState) => state.core.entities.modals.modalType,
  identity
);

export const currentTheme: (state: *) => "light" | "dark" = createSelector(
  (state: AppState) => state.config.get("theme", "light"),
  identity
);

export const notificationSystem = createSelector(
  (state: AppState) => state.app.get("notificationSystem"),
  identity
);

export const communicationByRef = (state: AppState) =>
  state.core.communication.contents.byRef;

export const communication = (
  state: AppState,
  { contentRef }: { contentRef: ContentRef }
) => communicationByRef(state).get(contentRef);
