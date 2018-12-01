/**
 * @module selectors
 */
import { createSelector } from "reselect";

import {
  AppState,
  JupyterHostRecord,
  ContentRef,
  KernelRef,
  KernelspecsByRefRecord
} from "@nteract/types";

import * as notebook from "./notebook";

// Export sub-selectors (those that operate on contents models for instance)
export { notebook };

function identity<T>(thing: T): T {
  return thing;
}

/**
 * Creates a server configuration from details about a given Jupyter host.
 * 
 * @param   host    The Jupyter host we are connected to
 * 
 * @returns         An object contain the endpoint, token
 */
export const serverConfig = (host: JupyterHostRecord) => {
  return {
    endpoint: host.origin + host.basePath,
    crossDomain: host.crossDomain,
    token: host.token
  };
};

/**
 * Returns the theme of the notebook. Returns "light" if no theme is defined.
 * 
 * @param   state   The state of the nteract application 
 * 
 * @returns         The theme of the nteract application     
 */
export const userTheme = (state: AppState): string =>
  state.config.get("theme", "light");

/**
 * Returns the version of the nteract application.
 */
export const appVersion = createSelector(
  (state: AppState) => state.app.version,
  identity
);

// Quick memoized host and kernel selection.
//
// Intended to be useful for a core app and be future proof for when we have
// both refs and selected/current hosts and kernels
/**
 * Returns the host the nteract application is connected to.
 */
export const currentHost = createSelector(
  (state: AppState) => state.app.host,
  identity
);

/**
 * Returns the contents, such as notebooks and files, that are currently accessible
 * within the current notebook application.
 * 
 * @param   state   The state of the nteract application
 * 
 * @returns         The contents in scope by the nteract application by ID 
 */
export const contentByRef = (state: AppState) =>
  state.core.entities.contents.byRef;

/**
 * 
 * @param   state                       The state of the nteract application 
 * @param   { contentRef: ContentRef }  A reference to the ContentRecord to retrieve
 * 
 * @returns                             The ContentRecord for the given ref
 */
export const content = (
  state: AppState,
  { contentRef }: { contentRef: ContentRef }
) => contentByRef(state).get(contentRef);

/**
 * Returns the model within the ContenteRecrd specified by contentRef.
 * For example, if the ContentRecord is a reference to a notebook object,
 * the model would contain the NotebookModel.
 * 
 * @param   state                       The state of the nteract application 
 * @param   { contentRef: ContentRef }  A reference to the ContentRecord to retrieve
 * 
 * @returns                             The model of the content under the current ref
 */
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

/**
 * Returns a ref to the kernel associated with a particular type of content.
 * Currently, this only support kernels associated with notebook contents.
 * Returns null if there are no contents or if the contents are not
 * a notebook.
 * 
 * @param   state                       The state of the nteract application 
 * @param   { contentRef: ContentRef }  A reference to the ContentRecord to retrieve
 * 
 * @returns                             The kernel associated with a notebook
 */
export const kernelRefByContentRef = (
  state: AppState,
  ownProps: { contentRef: ContentRef }
): KernelRef | null | undefined => {
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

/**
 * Returns a ref to the kernelspec of the kernel the nteract application
 * is currently connected to.
 * 
 * @param   state   The state of the nteract application
 * 
 * @returns         A ref to the kernelspec
 */
export const currentKernelspecsRef = (state: AppState) =>
  state.core.currentKernelspecsRef;

  /**
   * Returns a Map of the kernelspecs associated with each kernelspec ref.
   * 
   * @param state   The state of the nteract application
   * 
   * @returns        An association between a kernelspec ref and the kernelspec 
   */
export const kernelspecsByRef = (state: AppState) =>
  state.core.entities.kernelspecs.byRef;

  /**
   * Returns the kernelspec of the kernel that the nteract application is
   * currently connected to.
   */
export const currentKernelspecs: (
  state: AppState
) => KernelspecsByRefRecord | null | undefined = createSelector(
  currentKernelspecsRef,
  kernelspecsByRef,
  (ref, byRef) => (ref ? byRef.get(ref) : null)
);

/**
 * Returns a map of the available kernels keyed by the
 * kernel ref.
 * 
 * @param   state   The state of the nteract application
 * 
 * @returns         The kernels by ref 
 */
export const kernelsByRef = (state: AppState) =>
  state.core.entities.kernels.byRef;

/**
 * Returns the kernel associated with a given KernelRef.
 * 
 * @param   state                   The state of the nteract application
 * @param   { kernelRef: KernelRef} An object containing the KernelRef
 * 
 * @returns                         The kernel for the KernelRef 
 */
export const kernel = (
  state: AppState,
  { kernelRef }: { kernelRef: KernelRef }
) => kernelsByRef(state).get(kernelRef);

/**
 * Returns the KernelRef for the kernel the nteract application is currently
 * connected to.
 * 
 * @param   state   The state of the nteract application
 * 
 * @returns         The KernelRef for the kernel 
 */
export const currentKernelRef = (state: AppState) => state.core.kernelRef;

/**
 * Returns the kernelspec of the kernel that we are currently connected to.
 * Returns null if there is no kernel.
 */
export const currentKernel = createSelector(
  currentKernelRef,
  kernelsByRef,
  (kernelRef, byRef) => (kernelRef ? byRef.get(kernelRef) : null)
);

/**
 * Returns the type of the kernel the nteract application is currently
 * connected to. Returns `null` if there is no kernel.
 */
export const currentKernelType = createSelector(
  [currentKernel],
  kernel => {
    if (kernel && kernel.type) {
      return kernel.type;
    }
    return null;
  }
);

/**
 * Returns the state of the kernel the nteract application is currently
 * connected to. Returns "not connected" if there is no kernel.
 */
export const currentKernelStatus = createSelector(
  [currentKernel],
  kernel => {
    if (kernel && kernel.status) {
      return kernel.status;
    }
    return "not connected";
  }
);

/**
 * Returns the type of host the nteract application is currently connected
 * to. This is set to "jupyter" by default.
 */
export const currentHostType = createSelector(
  [currentHost],
  host => {
    if (host && host.type) {
      return host.type;
    }
    return null;
  }
);

/**
 * Returns whether or not we are currently connected to the kernel through
 * a ZeroMQ connection.
 */
export const isCurrentKernelZeroMQ = createSelector(
  [currentHostType, currentKernelType],
  (hostType, kernelType) => {
    return hostType === "local" && kernelType === "zeromq";
  }
);

/**
 * Returns true if the host we are currently connected to is a Jupyter
 * kernel.
 */
export const isCurrentHostJupyter = createSelector(
  [currentHostType],
  hostType => hostType === "jupyter"
);

/**
 * Returns whether or not we are currently connected to the kernel through
 * a websocket connection.
 */
export const isCurrentKernelJupyterWebsocket = createSelector(
  [currentHostType, currentKernelType],
  (hostType, kernelType) => {
    return hostType === "jupyter" && kernelType === "websocket";
  }
);

/**
 * Returns the Jupyter comms data for a given nteract application.
 */
export const comms = createSelector(
  (state: AppState) => state.comms,
  identity
);

/**
 * Returns the comms models that are stored in the nteract application state.
 */
export const models = createSelector(
  [comms],
  comms => comms.get("models")
);

/**
 * Returns the filepath for the content identified by a given ContentRef.
 * 
 * @param   state     The state of the nteract application 
 * @param   ownProps  An object containing the ContentRef
 * 
 * @returns           The filepath for the content 
 */
export const filepath = (
  state: AppState,
  ownProps: { contentRef: ContentRef }
): string | null => {
  const c = content(state, ownProps);
  if (!c) {
    return null;
  }
  return c.filepath;
};

/**
 * Returns the type of modal, such as the about modal, that is currently open
 * in the nteract application. 
 */
export const modalType = createSelector(
  (state: AppState) => state.core.entities.modals.modalType,
  identity
);

/**
 * Returns the current theme of the notebook application. Defaults to "light."
 */
export const currentTheme: (
  state: AppState
) => "light" | "dark" = createSelector(
  (state: AppState) => state.config.get("theme", "light"),
  identity
);

/**
 * Returns the notification system currently configured on the nteract application.
 * This can be used to display informational or error-related alerts to the user.
 */
export const notificationSystem = createSelector(
  (state: AppState) => state.app.get("notificationSystem"),
  identity
);

/**
 * Returns a Map of comms data keyed by the content refs in the current
 * application state.
 * 
 * @param   state   The state of the nteract application
 * 
 * @returns          Comms data keyed by content refs   
 */
export const communicationByRef = (state: AppState) =>
  state.core.communication.contents.byRef;

/**
 * Returns the comms data associated with a particular content object, such
 * as a notebook, in the nteract application.
 * 
 * @param   state   The state of the nteract application 
 * @param           The content ref
 * 
 * @returns         The comms data associated with a content
 */
export const communication = (
  state: AppState,
  { contentRef }: { contentRef: ContentRef }
) => communicationByRef(state).get(contentRef);
