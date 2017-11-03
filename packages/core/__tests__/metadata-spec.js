import * as constants from "../src/constants";
import { MetadataRecord } from "../src/records";

import { appendCellToNotebook, emptyCodeCell } from "@nteract/commutable";

import { dummyCommutable } from "../src/dummy";

import { metadata as reducers } from "../src/reducers";

const initialDocument = new Map();
initialDocument.set(
  "notebook",
  appendCellToNotebook(dummyCommutable, emptyCodeCell)
);

describe("changeFilename", () => {
  test("returns the same originalState if filename is undefined", () => {
    const originalState = new MetadataRecord({
      filename: "original.ipynb"
    });

    const action = { type: constants.CHANGE_FILENAME };

    const state = reducers(originalState, action);
    expect(state.filename).toBe("original.ipynb");
  });
  test("sets the filename if given a valid one", () => {
    const originalState = new MetadataRecord({
      filename: "original.ipynb"
    });

    const action = { type: constants.CHANGE_FILENAME, filename: "test.ipynb" };

    const state = reducers(originalState, action);
    expect(state.filename).toBe("test.ipynb");
  });
});
