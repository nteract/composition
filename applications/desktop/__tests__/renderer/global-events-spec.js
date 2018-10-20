/* @flow */

import { ipcRenderer as ipc } from "../../__mocks__/electron";

import * as globalEvents from "../../src/notebook/global-events";
import * as Immutable from "immutable";

import {
  createContentRef,
  makeStateRecord,
  makeEntitiesRecord,
  makeContentsRecord,
  makeNotebookContentRecord,
  makeDocumentRecord
} from "@nteract/core";

import {
  makeDesktopNotebookRecord,
  DESKTOP_NOTEBOOK_CLOSING_NOT_STARTED,
  DESKTOP_NOTEBOOK_CLOSING_STARTED,
  DESKTOP_NOTEBOOK_CLOSING_READY_TO_CLOSE
} from "../../src/notebook/state.js";

import * as actions from "../../src/notebook/actions.js";

const createStore = (
  contentRef,
  content,
  closingState: DesktopNotebookClosingState
) => ({
  getState: () => ({
    core: makeStateRecord({
      entities: makeEntitiesRecord({
        contents: makeContentsRecord({
          byRef: Immutable.Map({
            // $FlowFixMe: This really is a content ref, Flow can't handle typing it though
            [contentRef]: content
          })
        })
      })
    }),
    desktopNotebook: makeDesktopNotebookRecord().set(
      "closingState",
      closingState
    )
  })
});

describe("onBeforeUnloadOrReload", () => {
  test("if we are not yet closing the notebook, should initiate closeNotebook and cancel close event", done => {
    const contentRef = createContentRef();
    const store = createStore(
      contentRef,
      makeNotebookContentRecord({
        model: makeDocumentRecord({
          notebook: "not same",
          savedNotebook: "different"
        })
      }),
      DESKTOP_NOTEBOOK_CLOSING_NOT_STARTED
    );

    store.dispatch = action => {
      expect(action).toEqual(actions.closeNotebook({ contentRef: contentRef, reloading: false }));
      done();
    };

    const event = {};

    const result = globalEvents.onBeforeUnloadOrReload(contentRef, store, false, event);
    expect(result).toBe(false);
  });

  test("if we are in the process of closing the notebook, should continue to cancel close event", () => {
    const contentRef = createContentRef();
    const store = createStore(
      contentRef,
      makeNotebookContentRecord({
        model: makeDocumentRecord({
          notebook: "not same",
          savedNotebook: "different"
        })
      }),
      DESKTOP_NOTEBOOK_CLOSING_STARTED
    );
    const event = {};
    const result = globalEvents.onBeforeUnloadOrReload(contentRef, store, event, false);
    expect(result).toBe(false);
  });

  test("if we have completed closing the notebook, should not cancel close event", () => {
    const contentRef = createContentRef();
    const store = createStore(
      contentRef,
      makeNotebookContentRecord({
        model: makeDocumentRecord({
          notebook: "not same",
          savedNotebook: "different"
        })
      }),
      DESKTOP_NOTEBOOK_CLOSING_READY_TO_CLOSE
    );
    const event = {};
    const result = globalEvents.onBeforeUnloadOrReload(contentRef, store, event, false);
    expect(result).toBeUndefined();
  });
});

describe("initGlobalHandlers", () => {
  test("adds an unload property to the window object", () => {
    const contentRef = createContentRef();
    const store = createStore(contentRef);

    globalEvents.initGlobalHandlers(contentRef, store);

    expect(global.window.onbeforeunload).toBeDefined();
  });

  test("wires a listener for a reload msg from main process", (done) => {
    const contentRef = createContentRef();
    const store = createStore(contentRef);

    ipc.on = (event) => {
      if (event == "reload") done();
    };

    globalEvents.initGlobalHandlers(contentRef, store);
  });
});
