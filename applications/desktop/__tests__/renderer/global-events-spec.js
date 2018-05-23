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

const createStore = (contentRef, content) => ({
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
    })
  })
});

describe("beforeUnload", () => {
  test("should set event.returnValue if notebook is modified to prevent unload", () => {
    const contentRef = createContentRef();
    const store = createStore(
      contentRef,
      makeNotebookContentRecord({
        model: makeDocumentRecord({
          notebook: "not same",
          savedNotebook: "different"
        })
      })
    );

    const event = {};

    globalEvents.beforeUnload(contentRef, store, event);

    expect(event.returnValue).toBeDefined();
  });

  test("should should not set event.returnValue if notebook is saved", () => {
    const contentRef = createContentRef();
    const store = createStore(
      contentRef,
      makeNotebookContentRecord({
        model: makeDocumentRecord({
          notebook: "same",
          savedNotebook: "same"
        })
      })
    );

    const event = {};

    globalEvents.beforeUnload(contentRef, store, event);

    expect(event.returnValue).toBeUndefined();
  });
});

describe("initGlobalHandlers", () => {
  test("adds an unload poperty to the window object", () => {
    const contentRef = createContentRef();
    const store = createStore(contentRef);

    globalEvents.initGlobalHandlers(contentRef, store);
    expect(global.window.onunload).toBeDefined();
    expect(global.window.onbeforeunload).toBeDefined();
  });
});
