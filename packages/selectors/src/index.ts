import { AppState } from "@nteract/types";

import * as cell from "./core/contents/cell";
import * as notebook from "./core/contents/notebook";

// Export sub-selectors (those that operate on contents models for instance)
export { cell, notebook };

// Export all selectors from files for backwards-compatibility with older imports
export * from "./core/contents";
export * from "./core/hosts";
export * from "./core/kernels";
export * from "./core/kernelspecs";
export * from "./core/transforms";
export * from "./app";
export * from "./comms";

/**
 * Returns the type of modal, such as the about modal, that is currently open
 * in the nteract application.
 */
export const modalType = (state: AppState) =>
  state.core.entities.modals.modalType;

/**
 * Returns the list of ENQUEUE_ACTION actions that are waiting for the
 * kernel to successfully launch before executing.
 */
export const messageQueue = (state: AppState) =>
  state.core.entities.messages.messageQueue;
