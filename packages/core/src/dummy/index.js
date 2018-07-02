// @flow
/* eslint-disable no-plusplus */

import * as Immutable from "immutable";

import { Subject } from "rxjs";

import {
  monocellNotebook,
  emptyCodeCell,
  appendCellToNotebook,
  emptyNotebook
} from "@nteract/commutable";

/* Our createStore */
import { combineReducers, createStore, applyMiddleware } from "redux";
import { comms, config, core } from "../reducers";

export { dummyCommutable, dummy, dummyJSON } from "./dummy-nb";

import {
  makeNotebookContentRecord,
  makeRemoteKernelRecord,
  makeAppRecord,
  makeCommsRecord,
  makeKernelsRecord,
  makeDocumentRecord,
  makeContentsRecord,
  makeEntitiesRecord,
  makeStateRecord,
  createContentRef,
  createKernelRef
} from "../state";

const rootReducer = combineReducers({
  app: (state = makeAppRecord(), action) => state,
  comms,
  config,
  core
});

function hideCells(notebook) {
  return notebook.update("cellMap", cells =>
    notebook
      .get("cellOrder", Immutable.List())
      .reduce(
        (acc, id) => acc.setIn([id, "metadata", "inputHidden"], true),
        cells
      )
  );
}

/**
 * Creates a dummy notebook for Redux state for testing.
 *
 * @param {object} config - Configuration options for notebook
 * config.codeCellCount (number) - Number of empty code cells to be in notebook.
 * config.markdownCellCount (number) - Number of empty markdown cells to be in notebook.
 * config.hideAll (boolean) - Hide all cells in notebook
 * @returns {object} - A notebook for {@link DocumentRecord} for Redux store.
 * Created using the config object passed in.
 */
function buildDummyNotebook(config) {
  let notebook = monocellNotebook.setIn(
    ["metadata", "kernelspec", "name"],
    "python2"
  );

  if (config) {
    if (config.codeCellCount) {
      for (let i = 1; i < config.codeCellCount; i++) {
        notebook = appendCellToNotebook(notebook, emptyCodeCell);
      }
    }

    if (config.markdownCellCount) {
      for (let i = 0; i < config.markdownCellCount; i++) {
        notebook = appendCellToNotebook(
          notebook,
          emptyCodeCell.set("cell_type", "markdown")
        );
      }
    }

    if (config.hideAll) {
      notebook = hideCells(notebook);
    }
  }

  return notebook;
}

export function dummyStore(config: *) {
  const dummyNotebook = buildDummyNotebook(config);

  // $FlowFixMe: Faking out channels
  const frontendToShell = new Subject();
  // $FlowFixMe: Faking out channels
  const shellToFrontend = new Subject();
  const mockShell = Subject.create(frontendToShell, shellToFrontend);
  const mockIOPub = new Subject();
  const channels = mockShell;

  const kernelRef = createKernelRef();
  const contentRef = createContentRef();

  return createStore(rootReducer, {
    core: makeStateRecord({
      kernelRef,
      entities: makeEntitiesRecord({
        contents: makeContentsRecord({
          byRef: Immutable.Map({
            // $FlowFixMe: This really is a content ref, Flow can't handle typing it though
            [contentRef]: makeNotebookContentRecord({
              model: makeDocumentRecord({
                notebook: dummyNotebook,
                savedNotebook:
                  config && config.saved === true
                    ? dummyNotebook
                    : emptyNotebook,
                cellPagers: new Immutable.Map(),
                cellFocused:
                  config && config.codeCellCount > 1
                    ? dummyNotebook.get("cellOrder", Immutable.List()).get(1)
                    : null
              }),
              filepath:
                config && config.noFilename ? "" : "dummy-store-nb.ipynb"
            })
          })
        }),
        kernels: makeKernelsRecord({
          byRef: Immutable.Map({
            // $FlowFixMe: This really is a kernel ref, Flow can't handle typing it though
            [kernelRef]: makeRemoteKernelRecord({
              channels,
              status: "not connected"
            })
          })
        })
      })
    }),
    app: makeAppRecord({
      notificationSystem: {
        addNotification: () => {} // most of the time you'll want to mock this
      },
      githubToken: "TOKEN"
    }),
    config: Immutable.Map({
      theme: "light"
    }),
    comms: makeCommsRecord()
  });
}
