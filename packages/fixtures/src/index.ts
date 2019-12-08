/* eslint-disable no-plusplus */

import {
  appendCellToNotebook,
  emptyCodeCell,
  emptyMarkdownCell,
  emptyNotebook,
  ImmutableNotebook,
  JSONObject,
  monocellNotebook
} from "@nteract/commutable";
import * as Immutable from "immutable";
import { combineReducers, createStore } from "redux";
import { Subject } from "rxjs";

import { comms, config, core } from "@nteract/reducers";
import {
  AppState,
  createContentRef,
  createKernelRef,
  makeAppRecord,
  makeCommsRecord,
  makeContentsRecord,
  makeDocumentRecord,
  makeEntitiesRecord,
  makeKernelsRecord,
  makeNotebookContentRecord,
  makeRemoteKernelRecord,
  makeStateRecord
} from "@nteract/types";

export { fixtureCommutable, fixture, fixtureJSON } from "./fixture-nb";

const rootReducer = combineReducers({
  app: (state = makeAppRecord()) => state,
  comms,
  config,
  core
});

function hideCells(notebook: ImmutableNotebook) {
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
function buildFixtureNotebook(config: JSONObject) {
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
          emptyMarkdownCell.set("cell_type", "markdown")
        );
      }
    }

    if (config.hideAll) {
      notebook = hideCells(notebook);
    }
  }

  return notebook;
}

export const mockAppState = (config: JSONObject): AppState => {
  const dummyNotebook = buildFixtureNotebook(config);

  const frontendToShell = new Subject();
  const shellToFrontend = new Subject();
  const mockShell = Subject.create(frontendToShell, shellToFrontend);
  const channels = mockShell;

  const kernelRef = createKernelRef();
  const contentRef = createContentRef();

  return {
    core: makeStateRecord({
      kernelRef,
      entities: makeEntitiesRecord({
        contents: makeContentsRecord({
          byRef: Immutable.Map({
            [contentRef]: makeNotebookContentRecord({
              model: makeDocumentRecord({
                notebook: dummyNotebook,
                savedNotebook:
                  config && config.saved === true
                    ? dummyNotebook
                    : emptyNotebook,
                cellPagers: Immutable.Map(),
                cellFocused:
                  config && config.codeCellCount && config.codeCellCount > 1
                    ? dummyNotebook.get("cellOrder", Immutable.List()).get(1)
                    : null,
                kernelRef
              }),
              filepath:
                config && config.noFilename ? "" : "dummy-store-nb.ipynb"
            })
          })
        }),
        kernels: makeKernelsRecord({
          byRef: Immutable.Map({
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
  };
};

export function fixtureStore(config: JSONObject) {
  const initialAppState = mockAppState(config);

  return createStore(rootReducer, initialAppState as any);
}
