// @flow
/* eslint-disable max-len */
import { List, Map, Set, is } from "immutable";

import * as constants from "../../../src/notebook/constants";

import {
  emptyCodeCell,
  emptyMarkdownCell,
  fromJS,
  appendCellToNotebook
} from "@nteract/commutable";

import reducers from "../../../src/notebook/reducers";
import {
  reduceOutputs,
  cleanCellTransient
} from "../../../src/notebook/reducers/document";

import { dummyJSON, dummyCommutable } from "dummy-nb";

const Immutable = require("immutable");

const initialDocument = new Map();
const monocellDocument = initialDocument
  .set("notebook", appendCellToNotebook(dummyCommutable, emptyCodeCell))
  .set(
    "transient",
    new Immutable.Map({ keyPathsForDisplays: new Immutable.Map() })
  );

describe("reduceOutputs", () => {
  test("puts new outputs at the end by default", () => {
    const outputs = Immutable.List([
      Immutable.Map({ output_type: "stream", name: "stdout", text: "Woo" }),
      Immutable.Map({
        output_type: "error",
        ename: "well",
        evalue: "actually",
        traceback: Immutable.List()
      })
    ]);
    const newOutputs = reduceOutputs(outputs, {
      output_type: "display_data",
      data: {},
      metadata: {}
    });

    expect(JSON.stringify(newOutputs)).toEqual(
      JSON.stringify(
        Immutable.List([
          Immutable.Map({ output_type: "stream", name: "stdout", text: "Woo" }),
          Immutable.Map({
            output_type: "error",
            ename: "well",
            evalue: "actually",
            traceback: Immutable.List()
          }),
          Immutable.Map({
            output_type: "display_data",
            data: Immutable.Map(),
            metadata: Immutable.Map()
          })
        ])
      )
    );
  });

  test("handles the case of a single stream output", () => {
    const outputs = Immutable.fromJS([
      { name: "stdout", text: "hello", output_type: "stream" }
    ]);
    const newOutputs = reduceOutputs(outputs, {
      name: "stdout",
      text: " world",
      output_type: "stream"
    });

    expect(JSON.stringify(newOutputs)).toBe(
      JSON.stringify(
        Immutable.fromJS([
          { name: "stdout", text: "hello world", output_type: "stream" }
        ])
      )
    );
  });

  test("merges streams of text", () => {
    let outputs = Immutable.List();

    outputs = reduceOutputs(outputs, {
      name: "stdout",
      text: "hello",
      output_type: "stream"
    });
    expect(
      is(
        outputs,
        Immutable.fromJS([
          { name: "stdout", text: "hello", output_type: "stream" }
        ])
      )
    ).toBe(true);

    outputs = reduceOutputs(outputs, {
      name: "stdout",
      text: " world",
      output_type: "stream"
    });
    expect(
      is(
        outputs,
        Immutable.fromJS([
          { name: "stdout", text: "hello world", output_type: "stream" }
        ])
      )
    ).toBe(true);
  });

  test("keeps respective streams together", () => {
    const outputs = Immutable.fromJS([
      { name: "stdout", text: "hello", output_type: "stream" },
      { name: "stderr", text: "errors are", output_type: "stream" }
    ]);
    const newOutputs = reduceOutputs(outputs, {
      name: "stdout",
      text: " world",
      output_type: "stream"
    });

    expect(JSON.stringify(newOutputs)).toBe(
      JSON.stringify(
        Immutable.fromJS([
          { name: "stdout", text: "hello world", output_type: "stream" },
          { name: "stderr", text: "errors are", output_type: "stream" }
        ])
      )
    );

    const evenNewerOutputs = reduceOutputs(newOutputs, {
      name: "stderr",
      text: " informative",
      output_type: "stream"
    });
    expect(JSON.stringify(evenNewerOutputs)).toBe(
      JSON.stringify(
        Immutable.fromJS([
          { name: "stdout", text: "hello world", output_type: "stream" },
          {
            name: "stderr",

            text: "errors are informative",
            output_type: "stream"
          }
        ])
      )
    );
  });
});

describe("setNotebook", () => {
  test("converts a JSON notebook to our commutable notebook and puts in state", () => {
    const initialState = { app: [], document: initialDocument };
    const notebook = fromJS(dummyJSON);
    const state = reducers(initialState, {
      type: constants.SET_NOTEBOOK,
      notebook
    });
    expect(state.document.getIn(["notebook", "nbformat"])).toBe(4);
  });
});

describe("setNotebookCheckpoint", () => {
  test("stores saved notebook", () => {
    const initialState = { app: new Map(), document: initialDocument };

    const state = reducers(initialState, {
      type: constants.DONE_SAVING,
      notebook: dummyCommutable
    });
    expect(
      is(state.document.get("notebook"), initialDocument.get("notebook"))
    ).toBe(true);
    expect(is(state.document.get("savedNotebook"), dummyCommutable)).toBe(true);
  });
});

describe("setLanguageInfo", () => {
  test("adds the metadata fields for the kernelspec and kernel_info", () => {
    const initialState = { app: [], document: initialDocument };
    const kernelInfo = {
      name: "french",
      spec: { language: "french", display_name: "français" }
    };
    const state = reducers(initialState, {
      type: constants.SET_KERNEL_INFO,
      kernelInfo
    });
    const metadata = state.document.getIn(["notebook", "metadata"]);
    expect(metadata.getIn(["kernel_info", "name"])).toBe("french");
    expect(metadata.getIn(["kernelspec", "name"])).toBe("french");
    expect(metadata.getIn(["kernelspec", "display_name"])).toBe("français");
  });
});

describe("focusCell", () => {
  test("should set cellFocused to the appropriate cell ID", () => {
    const originalState = { document: monocellDocument };

    const id = originalState.document.getIn(["notebook", "cellOrder"]).last();

    const action = { type: constants.FOCUS_CELL, id };

    const state = reducers(originalState, action);
    expect(state.document.get("cellFocused")).toBe(id);
  });
});

describe("focusNextCell", () => {
  test("should focus the next cell if not the last cell", () => {
    const originalState = { document: monocellDocument };

    const id = originalState.document.getIn(["notebook", "cellOrder"]).first();

    const action = { type: constants.FOCUS_NEXT_CELL, id };

    const state = reducers(originalState, action);
    expect(state.document.get("cellFocused")).not.toBeNull();
  });
  test("should return same state if last cell and createCellIfUndefined is false", () => {
    const originalState = { document: monocellDocument };

    const id = originalState.document.getIn(["notebook", "cellOrder"]).last();

    const action = { type: constants.FOCUS_NEXT_CELL, id };

    const state = reducers(originalState, action);
    expect(state.document.get("cellFocused")).not.toBeNull();
    expect(state.document.getIn(["notebook", "cellOrder"]).size).toBe(3);
  });
  test("should create and focus a new code cell if last cell and last cell is code cell", () => {
    const originalState = {
      document: monocellDocument.set(
        "notebook",
        appendCellToNotebook(dummyCommutable, emptyCodeCell)
      )
    };

    const id = originalState.document.getIn(["notebook", "cellOrder"]).last();

    const action = {
      type: constants.FOCUS_NEXT_CELL,
      id,
      createCellIfUndefined: true
    };

    const state = reducers(originalState, action);
    const newCellId = state.document.getIn(["notebook", "cellOrder"]).last();
    const newCellType = state.document.getIn([
      "notebook",
      "cellMap",
      newCellId,
      "cell_type"
    ]);

    expect(state.document.cellFocused).not.toBeNull();
    expect(state.document.getIn(["notebook", "cellOrder"]).size).toBe(4);
    expect(newCellType).toBe("code");
  });
  test("should create and focus a new markdown cell if last cell and last cell is markdown cell", () => {
    const originalState = {
      document: monocellDocument.set(
        "notebook",
        appendCellToNotebook(dummyCommutable, emptyMarkdownCell)
      )
    };

    const id = originalState.document.getIn(["notebook", "cellOrder"]).last();

    const action = {
      type: constants.FOCUS_NEXT_CELL,
      id,
      createCellIfUndefined: true
    };

    const state = reducers(originalState, action);
    const newCellId = state.document.getIn(["notebook", "cellOrder"]).last();
    const newCellType = state.document.getIn([
      "notebook",
      "cellMap",
      newCellId,
      "cell_type"
    ]);

    expect(state.document.cellFocused).not.toBeNull();
    expect(state.document.getIn(["notebook", "cellOrder"]).size).toBe(4);
    expect(newCellType).toBe("markdown");
  });
});

describe("focusPreviousCell", () => {
  test("should focus the previous cell", () => {
    const originalState = {
      document: initialDocument.set("notebook", dummyCommutable)
    };

    const id = originalState.document.getIn(["notebook", "cellOrder"]).last();
    const previousId = originalState.document
      .getIn(["notebook", "cellOrder"])
      .first();

    const action = { type: constants.FOCUS_PREVIOUS_CELL, id };

    const state = reducers(originalState, action);
    expect(state.document.get("cellFocused")).toBe(previousId);
  });
});

describe("focusCellEditor", () => {
  test("should set editorFocused to the appropriate cell ID", () => {
    const originalState = { document: monocellDocument };

    const id = originalState.document.getIn(["notebook", "cellOrder"]).last();

    const action = { type: constants.FOCUS_CELL_EDITOR, id };

    const state = reducers(originalState, action);
    expect(state.document.get("editorFocused")).toBe(id);
  });
});

describe("focusNextCellEditor", () => {
  test("should focus the editor of the next cell", () => {
    const originalState = { document: monocellDocument };

    const id = originalState.document.getIn(["notebook", "cellOrder"]).first();

    const action = { type: constants.FOCUS_NEXT_CELL_EDITOR, id };

    const state = reducers(originalState, action);
    expect(state.document.get("editorFocused")).not.toBeNull();
  });
});

describe("focusPreviousCellEditor", () => {
  test("should focus the editor of the previous cell", () => {
    const originalState = {
      document: initialDocument.set("notebook", dummyCommutable)
    };

    const id = originalState.document.getIn(["notebook", "cellOrder"]).last();
    const previousId = originalState.document
      .getIn(["notebook", "cellOrder"])
      .first();

    const action = { type: constants.FOCUS_PREVIOUS_CELL_EDITOR, id };

    const state = reducers(originalState, action);
    expect(state.document.get("editorFocused")).toBe(previousId);
  });
});

describe("toggleStickyCell", () => {
  test("should stick the cell given its ID", () => {
    const doc = initialDocument
      .set("notebook", dummyCommutable)
      .set("stickyCells", new Set());
    const originalState = { document: doc };

    const id = originalState.document.getIn(["notebook", "cellOrder"]).first();

    const action = { type: constants.TOGGLE_STICKY_CELL, id };

    const state = reducers(originalState, action);
    expect(state.document.hasIn(["stickyCells", id])).toBe(true);
  });
  test("should unstick a stuck cell given its ID", () => {
    const id = dummyCommutable.get("cellOrder").first();
    const doc = initialDocument
      .set("notebook", dummyCommutable)
      .set("stickyCells", new Set([id]));

    const originalState = { document: doc };

    const action = { type: constants.TOGGLE_STICKY_CELL, id };

    const state = reducers(originalState, action);
    expect(state.document.hasIn(["stickyCells", id])).toBe(false);
  });
});

describe("updateExecutionCount", () => {
  test("updates the execution count by id", () => {
    const originalState = { document: monocellDocument };

    const id = originalState.document.getIn(["notebook", "cellOrder"]).last();

    const action = {
      type: "SET_IN_CELL",
      id,
      path: ["execution_count"],
      value: 42
    };

    const state = reducers(originalState, action);
    expect(
      state.document.getIn(["notebook", "cellMap", id, "execution_count"])
    ).toBe(42);
  });
});

describe("moveCell", () => {
  test("should swap the first and last cell appropriately", () => {
    const originalState = {
      document: initialDocument.set("notebook", dummyCommutable)
    };

    const cellOrder = originalState.document.getIn(["notebook", "cellOrder"]);
    const id = cellOrder.last();
    const destinationId = cellOrder.first();

    const action = { type: constants.MOVE_CELL, id, destinationId };

    const state = reducers(originalState, action);
    expect(state.document.getIn(["notebook", "cellOrder"]).last()).toBe(id);
    expect(state.document.getIn(["notebook", "cellOrder"]).first()).toBe(
      destinationId
    );
  });
  test("should move a cell above another when asked", () => {
    const originalState = {
      document: initialDocument.set("notebook", dummyCommutable)
    };

    const cellOrder = originalState.document.getIn(["notebook", "cellOrder"]);
    const id = cellOrder.last();
    const destinationId = cellOrder.first();

    const action = {
      type: constants.MOVE_CELL,
      id,
      destinationId,
      above: true
    };

    const state = reducers(originalState, action);
    expect(state.document.getIn(["notebook", "cellOrder"]).last()).toBe(
      destinationId
    );
    expect(state.document.getIn(["notebook", "cellOrder"]).first()).toBe(id);
  });
  test("should move a cell above another when asked", () => {
    const originalState = reducers(
      { document: initialDocument.set("notebook", dummyCommutable) },
      {
        type: "NEW_CELL_AFTER",
        id: dummyCommutable.get("cellOrder").first(),
        cellType: "markdown",
        source: "# Woo\n*Yay*"
      }
    );

    const cellOrder = originalState.document.getIn(["notebook", "cellOrder"]);

    const action = {
      type: constants.MOVE_CELL,
      id: cellOrder.get(0),
      destinationId: cellOrder.get(1)
    };
    // implicitly above: false

    const state = reducers(originalState, action);
    expect(state.document.getIn(["notebook", "cellOrder"]).toJS()).toEqual([
      cellOrder.get(1),
      cellOrder.get(0),
      cellOrder.get(2)
    ]);

    const action2 = {
      type: constants.MOVE_CELL,
      id: cellOrder.get(0),
      destinationId: cellOrder.get(1),
      above: true
    };

    const state2 = reducers(originalState, action2);
    expect(state2.document.getIn(["notebook", "cellOrder"]).toJS()).toEqual([
      cellOrder.get(0),
      cellOrder.get(1),
      cellOrder.get(2)
    ]);
  });
});

describe("removeCell", () => {
  test("should remove a cell given an ID", () => {
    const originalState = { document: monocellDocument };

    const id = originalState.document.getIn(["notebook", "cellOrder"]).first();

    const action = { type: constants.REMOVE_CELL, id };

    const state = reducers(originalState, action);
    expect(state.document.getIn(["notebook", "cellOrder"]).size).toBe(2);
  });
});

describe("clearOutputs", () => {
  test("should clear outputs list", () => {
    const originalState = {
      document: initialDocument
        .set(
          "notebook",
          appendCellToNotebook(
            dummyCommutable,
            emptyCodeCell.set("outputs", ["dummy outputs"])
          )
        )
        .set(
          "transient",
          new Immutable.Map({ keyPathsForDisplays: new Immutable.Map() })
        )
    };

    const id = originalState.document.getIn(["notebook", "cellOrder"]).last();

    const action = { type: constants.CLEAR_OUTPUTS, id };

    const state = reducers(originalState, action);
    const outputs = state.document.getIn([
      "notebook",
      "cellMap",
      id,
      "outputs"
    ]);
    expect(outputs).toBe(List.of());
  });
  test("doesn't clear outputs on markdown cells", () => {
    const originalState = {
      document: initialDocument.set(
        "notebook",
        appendCellToNotebook(dummyCommutable, emptyMarkdownCell)
      )
    };

    const id = originalState.document.getIn(["notebook", "cellOrder"]).last();

    const action = { type: constants.CLEAR_OUTPUTS, id };

    const state = reducers(originalState, action);
    const outputs = state.document.getIn([
      "notebook",
      "cellMap",
      id,
      "outputs"
    ]);
    expect(outputs).toBeUndefined();
  });
});

describe("newCellAfter", () => {
  test("creates a brand new cell after the given id", () => {
    const originalState = { document: monocellDocument };
    const id = originalState.document.getIn(["notebook", "cellOrder"]).last();

    const action = { type: constants.NEW_CELL_AFTER, id, cellType: "markdown" };

    const state = reducers(originalState, action);
    expect(state.document.getIn(["notebook", "cellOrder"]).size).toBe(4);
    const cellID = state.document.getIn(["notebook", "cellOrder"]).last();
    const cell = state.document.getIn(["notebook", "cellMap", cellID]);
    expect(cell.get("cell_type")).toBe("markdown");
  });
});

describe("newCellBefore", () => {
  test("creates a new cell after the given id", () => {
    const originalState = {
      document: initialDocument.set("notebook", dummyCommutable)
    };

    const id = originalState.document.getIn(["notebook", "cellOrder"]).last();

    const action = {
      type: constants.NEW_CELL_BEFORE,
      id,
      cellType: "markdown"
    };

    const state = reducers(originalState, action);
    expect(state.document.getIn(["notebook", "cellOrder"]).size).toBe(3);
    expect(state.document.getIn(["notebook", "cellOrder"]).last()).toBe(id);
  });
});

describe("mergeCellAfter", () => {
  test("merges cells appropriately", () => {
    const originalState = {
      document: initialDocument.set("notebook", dummyCommutable)
    };

    const id = originalState.document.getIn(["notebook", "cellOrder"]).first();
    const action = { type: constants.MERGE_CELL_AFTER, id };

    const state = reducers(originalState, action);
    expect(state.document.getIn(["notebook", "cellOrder"]).size).toBe(1);
    expect(state.document.getIn(["notebook", "cellOrder"]).first()).toBe(id);
  });
  test("should do nothing if merging the last cell", () => {
    const originalState = {
      document: initialDocument.set("notebook", dummyCommutable)
    };

    const id = originalState.document.getIn(["notebook", "cellOrder"]).last();
    const action = { type: constants.MERGE_CELL_AFTER, id };

    const state = reducers(originalState, action);
    expect(state.document).toEqual(originalState.document);
  });
});

describe("newCellAppend", () => {
  test("appends a new code cell at the end", () => {
    const originalState = {
      document: initialDocument.set("notebook", dummyCommutable)
    };

    const action = { type: constants.NEW_CELL_APPEND, cellType: "code" };

    const state = reducers(originalState, action);
    expect(state.document.getIn(["notebook", "cellOrder"]).size).toBe(3);
  });
});

describe("updateSource", () => {
  test("updates the source of the cell", () => {
    const originalState = {
      document: initialDocument.set("notebook", dummyCommutable)
    };

    const id = originalState.document.getIn(["notebook", "cellOrder"]).first();

    const action = {
      type: "SET_IN_CELL",
      id,
      path: ["source"],
      value: "This is a test"
    };

    const state = reducers(originalState, action);
    expect(state.document.getIn(["notebook", "cellMap", id, "source"])).toBe(
      "This is a test"
    );
  });
});

describe("overwriteMetadata", () => {
  test("overwrites notebook metadata appropriately", () => {
    const originalState = { document: monocellDocument };

    const action = {
      type: constants.OVERWRITE_METADATA_FIELD,
      field: "name",
      value: "javascript"
    };

    const state = reducers(originalState, action);
    expect(state.document.getIn(["notebook", "metadata", "name"])).toBe(
      "javascript"
    );
  });
});

describe("deleteMetadata", () => {
  test("deletes notebook metadata appropriately", () => {
    const originalState = {
      document: monocellDocument.setIn(
        ["notebook", "metadata", "name"],
        "johnwashere"
      )
    };
    const action = { type: constants.DELETE_METADATA_FIELD, field: "name" };
    const state = reducers(originalState, action);
    expect(state.document.getIn(["notebook", "metadata", "name"])).toBe(
      undefined
    );
  });
});

describe("changeOutputVisibility", () => {
  test("changes the visibility on a single cell", () => {
    const originalState = {
      document: monocellDocument.updateIn(["notebook", "cellMap"], cells =>
        cells.map(value => value.setIn(["metadata", "outputHidden"], false))
      )
    };

    const id = originalState.document.getIn(["notebook", "cellOrder"]).first();

    const action = { type: constants.CHANGE_OUTPUT_VISIBILITY, id };

    const state = reducers(originalState, action);
    expect(
      state.document.getIn([
        "notebook",
        "cellMap",
        id,
        "metadata",
        "outputHidden"
      ])
    ).toBe(true);
  });
});

describe("changeInputVisibility", () => {
  test("changes the input visibility on a single cell", () => {
    const originalState = {
      document: monocellDocument.updateIn(["notebook", "cellMap"], cells =>
        cells.map(value => value.setIn(["metadata", "inputHidden"], false))
      )
    };

    const id = originalState.document.getIn(["notebook", "cellOrder"]).first();

    const action = { type: constants.CHANGE_INPUT_VISIBILITY, id };

    const state = reducers(originalState, action);
    expect(
      state.document.getIn([
        "notebook",
        "cellMap",
        id,
        "metadata",
        "inputHidden"
      ])
    ).toBe(true);
  });
});

describe("clearOutputs", () => {
  test("clears out cell outputs", () => {
    const originalState = { document: monocellDocument };

    const id = originalState.document.getIn(["notebook", "cellOrder"]).last();

    const action = { type: constants.CLEAR_OUTPUTS, id };

    const state = reducers(originalState, action);
    expect(
      state.document.getIn(["notebook", "cellMap", id, "outputs"]).count()
    ).toBe(0);
  });
});

describe("updateCellPagers", () => {
  test("updates cell pagers", () => {
    const originalState = { document: monocellDocument };

    const id = originalState.document.getIn(["notebook", "cellOrder"]).first();

    const action = {
      type: constants.UPDATE_CELL_PAGERS,
      id,
      pagers: "Test pagers"
    };

    const state = reducers(originalState, action);
    expect(state.document.getIn(["cellPagers", id])).toBe("Test pagers");
  });
});

describe("updateCellStatus", () => {
  test("updates cell status", () => {
    const originalState = { document: monocellDocument };

    const id = originalState.document.getIn(["notebook", "cellOrder"]).first();

    const action = {
      type: constants.UPDATE_CELL_STATUS,
      id,
      status: "test status"
    };

    const state = reducers(originalState, action);
    expect(state.document.getIn(["transient", "cellMap", id, "status"])).toBe(
      "test status"
    );
  });
});

describe("setLanguageInfo", () => {
  test("sets the language object", () => {
    const originalState = { document: monocellDocument };

    const action = { type: constants.SET_LANGUAGE_INFO, langInfo: "test" };

    const state = reducers(originalState, action);
    expect(
      state.document.getIn(["notebook", "metadata", "language_info"])
    ).toBe("test");
  });
});

describe("copyCell", () => {
  test("copies a cell", () => {
    const originalState = { document: monocellDocument };

    const id = originalState.document.getIn(["notebook", "cellOrder"]).first();
    const cell = originalState.document.getIn(["notebook", "cellMap", id]);

    const action = { type: constants.COPY_CELL, id };

    const state = reducers(originalState, action);
    expect(state.document.getIn(["copied", "cell"])).toBe(cell);
    expect(state.document.getIn(["copied", "id"])).toBe(id);
  });
});

describe("cutCell", () => {
  test("cuts a cell", () => {
    const originalState = { document: monocellDocument };

    const id = originalState.document.getIn(["notebook", "cellOrder"]).first();
    const cell = originalState.document.getIn(["notebook", "cellMap", id]);

    const action = { type: constants.CUT_CELL, id };

    const state = reducers(originalState, action);
    expect(state.document.getIn(["copied", "cell"])).toBe(cell);
    expect(state.document.getIn(["copied", "id"])).toBe(id);
    expect(state.document.getIn(["notebook", "cellMap", id])).toBeUndefined();
  });
});

describe("pasteCell", () => {
  test("pastes a cell", () => {
    const id = monocellDocument.getIn(["notebook", "cellOrder"]).first();
    const cell = monocellDocument.getIn(["notebook", "cellMap", id]);

    const originalState = {
      document: monocellDocument.set(
        "copied",
        new Map({
          cell,
          id
        })
      )
    };

    const action = { type: constants.PASTE_CELL };

    const state = reducers(originalState, action);
    const copiedId = state.document.getIn(["notebook", "cellOrder", 1]);

    expect(state.document.getIn(["notebook", "cellOrder"]).size).toBe(4);
    expect(copiedId).not.toBe(id);
    expect(
      state.document.getIn(["notebook", "cellMap", copiedId, "source"])
    ).toBe(cell.get("source"));
  });
});

describe("changeCellType", () => {
  test("converts code cell to markdown cell", () => {
    const originalState = { document: monocellDocument };

    const id = monocellDocument.getIn(["notebook", "cellOrder"]).last();

    const action = { type: constants.CHANGE_CELL_TYPE, id, to: "markdown" };

    const state = reducers(originalState, action);

    expect(state.document.getIn(["notebook", "cellMap", id, "cell_type"])).toBe(
      "markdown"
    );
  });
  test("converts markdown cell to code cell", () => {
    const originalState = { document: monocellDocument };

    const id = monocellDocument.getIn(["notebook", "cellOrder"]).first();

    const action = { type: constants.CHANGE_CELL_TYPE, id, to: "code" };

    const state = reducers(originalState, action);

    expect(state.document.getIn(["notebook", "cellMap", id, "cell_type"])).toBe(
      "code"
    );
    expect(
      state.document.getIn(["notebook", "cellMap", id, "outputs"])
    ).toBeDefined();
  });
  test("does nothing if cell type is same", () => {
    const originalState = { document: monocellDocument };

    const id = monocellDocument.getIn(["notebook", "cellOrder"]).first();

    const action = { type: constants.CHANGE_CELL_TYPE, id, to: "markdown" };

    const state = reducers(originalState, action);
    expect(state.document).toBe(originalState.document);
  });
});

describe("toggleOutputExpansion", () => {
  test("changes outputExpanded set", () => {
    const originalState = {
      document: monocellDocument.updateIn(["notebook", "cellMap"], cells =>
        cells.map(value => value.setIn(["metadata", "outputExpanded"], false))
      )
    };

    const id = originalState.document.getIn(["notebook", "cellOrder"]).first();

    const action = { type: constants.TOGGLE_OUTPUT_EXPANSION, id };

    const state = reducers(originalState, action);
    expect(
      state.document.getIn([
        "notebook",
        "cellMap",
        id,
        "metadata",
        "outputExpanded"
      ])
    ).toBe(true);
  });
});
describe("appendOutput", () => {
  test("appends outputs", () => {
    const originalState = { document: monocellDocument };

    const id = originalState.document.getIn(["notebook", "cellOrder", 2]);

    const action = {
      type: constants.APPEND_OUTPUT,
      id,
      output: {
        output_type: "display_data",
        data: { "text/html": "<marquee>wee</marquee>" }
      }
    };

    const state = reducers(originalState, action);
    expect(
      is(
        state.document.getIn(["notebook", "cellMap", id, "outputs"]),
        Immutable.fromJS([
          {
            output_type: "display_data",
            data: { "text/html": "<marquee>wee</marquee>" }
          }
        ])
      )
    ).toBe(true);

    expect(state.document.getIn(["transient", "keyPathsForDisplays"])).toEqual(
      Immutable.Map()
    );
  });
  test("appends output and tracks display IDs", () => {
    const originalState = { document: monocellDocument };

    const id = originalState.document.getIn(["notebook", "cellOrder", 2]);

    const action = {
      type: constants.APPEND_OUTPUT,
      id,
      output: {
        output_type: "display_data",
        data: { "text/html": "<marquee>wee</marquee>" },
        transient: { display_id: "1234" }
      }
    };

    const state = reducers(originalState, action);
    expect(
      is(
        state.document.getIn(["notebook", "cellMap", id, "outputs"]),
        Immutable.fromJS([
          {
            output_type: "display_data",
            data: { "text/html": "<marquee>wee</marquee>" }
          }
        ])
      )
    ).toBe(true);
    expect(
      is(
        state.document.getIn(["transient", "keyPathsForDisplays", "1234"]),
        Immutable.fromJS([["notebook", "cellMap", id, "outputs", 0]])
      )
    ).toBe(true);
  });
});

describe("updateDisplay", () => {
  test("updates all displays which use the keypath", () => {
    const originalState = { document: monocellDocument };

    const id = originalState.document.getIn(["notebook", "cellOrder", 2]);

    const actions = [
      {
        type: constants.APPEND_OUTPUT,
        id,
        output: {
          output_type: "display_data",
          data: { "text/html": "<marquee>wee</marquee>" },
          transient: { display_id: "1234" }
        }
      },
      {
        type: constants.UPDATE_DISPLAY,
        output: {
          output_type: "display_data",
          data: { "text/html": "<marquee>WOO</marquee>" },
          transient: { display_id: "1234" }
        }
      }
    ];

    const state = actions.reduce(
      (s, action) => reducers(s, action),
      originalState
    );
    expect(
      is(
        state.document.getIn(["notebook", "cellMap", id, "outputs"]),
        Immutable.fromJS([
          {
            output_type: "display_data",
            data: { "text/html": "<marquee>WOO</marquee>" }
          }
        ])
      )
    ).toBe(true);
  });
});

describe("cleanCellTransient", () => {
  test("cleans out keyPaths that reference a particular cell ID", () => {
    const keyPathsForDisplays = Immutable.fromJS({
      1234: [
        ["notebook", "cellMap", "0000", "outputs", 0],
        ["notebook", "cellMap", "XYZA", "outputs", 0],
        ["notebook", "cellMap", "0000", "outputs", 1]
      ],
      5678: [["notebook", "cellMap", "XYZA", "outputs", 1]]
    });
    const state = new Immutable.Map({
      transient: new Immutable.Map({
        keyPathsForDisplays
      })
    });

    expect(
      cleanCellTransient(state, "0000").getIn([
        "transient",
        "keyPathsForDisplays"
      ])
    ).toEqual(
      Immutable.fromJS({
        1234: [["notebook", "cellMap", "XYZA", "outputs", 0]],
        5678: [["notebook", "cellMap", "XYZA", "outputs", 1]]
      })
    );

    expect(
      cleanCellTransient(state, "XYZA").getIn([
        "transient",
        "keyPathsForDisplays"
      ])
    ).toEqual(
      Immutable.fromJS({
        1234: [
          ["notebook", "cellMap", "0000", "outputs", 0],
          ["notebook", "cellMap", "0000", "outputs", 1]
        ],
        5678: []
      })
    );
  });
});
