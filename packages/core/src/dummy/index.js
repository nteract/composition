/* eslint-disable no-plusplus */
// @flow

import * as Immutable from "immutable";

import {
  monocellNotebook,
  emptyCodeCell,
  appendCellToNotebook
} from "@nteract/commutable";

/* Our createStore */
import { combineReducers, createStore, applyMiddleware } from "redux";
import { document, comms, config } from "../reducers";

export { dummyCommutable, dummy, dummyJSON } from "./dummy-nb";

const rootReducer = combineReducers({
  // Fake out app, since it comes from
  app: (state = makeAppRecord(), action) => state,
  document,
  comms,
  config
});

import type { AppState } from "@nteract/types/core/records";
import { makeAppRecord } from "@nteract/types/core/records";

/**
function configureStore(initialState: AppState) {
  return createStore(rootReducer, initialState, applyMiddleware(...middlewares));
}
**/

import { DocumentRecord, CommsRecord } from "@nteract/types/core/records";

function hideCells(notebook) {
  return notebook.update("cellMap", cells =>
    // $FlowFixMe: Notebook should be a typed record.
    notebook
      .get("cellOrder")
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

  return createStore(rootReducer, {
    document: DocumentRecord({
      notebook: dummyNotebook,
      savedNotebook: config && config.saved === true ? dummyNotebook : null,
      cellPagers: new Immutable.Map(),
      stickyCells: new Immutable.Set(),
      cellFocused:
        config && config.codeCellCount > 1
          ? // $FlowFixMe: Notebook should be typed.
            dummyNotebook.get("cellOrder").get(1)
          : null,
      filename: config && config.noFilename ? "" : "dummy-store-nb.ipynb"
    }),
    app: makeAppRecord({
      executionState: "not connected",
      notificationSystem: {
        addNotification: () => {} // most of the time you'll want to mock this
      },
      token: "TOKEN",
      channels: "channelInfo"
    }),
    config: Immutable.Map({
      theme: "light"
    }),
    comms: CommsRecord({})
  });
}
