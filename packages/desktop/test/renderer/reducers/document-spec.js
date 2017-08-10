/* eslint-disable max-len */
import { List, Map, Set } from "immutable";

import { expect } from "chai";

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

import { dummyJSON, dummyCommutable } from "../dummy-nb";

const Immutable = require("immutable");

const initialDocument = new Map();
const monocellDocument = initialDocument
  .set("notebook", appendCellToNotebook(dummyCommutable, emptyCodeCell))
  .set(
    "transient",
    new Immutable.Map({ keyPathsForDisplays: new Immutable.Map() })
  );

describe("reduceOutputs", () => {
  it("puts new outputs at the end by default", () => {
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

    expect(newOutputs).to.deep.equal(
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
    );
  });

  it("handles the case of a single stream output", () => {
    const outputs = Immutable.fromJS([
      { name: "stdout", text: "hello", output_type: "stream" }
    ]);
    const newOutputs = reduceOutputs(outputs, {
      name: "stdout",
      text: " world",
      output_type: "stream"
    });

    expect(newOutputs).to.equal(
      Immutable.fromJS([
        { name: "stdout", text: "hello world", output_type: "stream" }
      ])
    );
  });

  it("merges streams of text", () => {
    let outputs = Immutable.List();

    outputs = reduceOutputs(outputs, {
      name: "stdout",
      text: "hello",
      output_type: "stream"
    });
    expect(outputs).to.equal(
      Immutable.fromJS([
        { name: "stdout", text: "hello", output_type: "stream" }
      ])
    );

    outputs = reduceOutputs(outputs, {
      name: "stdout",
      text: " world",
      output_type: "stream"
    });
    expect(outputs).to.equal(
      Immutable.fromJS([
        { name: "stdout", text: "hello world", output_type: "stream" }
      ])
    );
  });

  it("keeps respective streams together", () => {
    const outputs = Immutable.fromJS([
      { name: "stdout", text: "hello", output_type: "stream" },
      { name: "stderr", text: "errors are", output_type: "stream" }
    ]);
    const newOutputs = reduceOutputs(outputs, {
      name: "stdout",
      text: " world",
      output_type: "stream"
    });

    expect(newOutputs).to.equal(
      Immutable.fromJS([
        { name: "stdout", text: "hello world", output_type: "stream" },
        { name: "stderr", text: "errors are", output_type: "stream" }
      ])
    );

    const evenNewerOutputs = reduceOutputs(newOutputs, {
      name: "stderr",
      text: " informative",
      output_type: "stream"
    });
    expect(evenNewerOutputs).to.equal(
      Immutable.fromJS([
        { name: "stdout", text: "hello world", output_type: "stream" },
        {
          name: "stderr",
          text: "errors are informative",
          output_type: "stream"
        }
      ])
    );
  });
});

describe("setNotebook", () => {
  it("converts a JSON notebook to our commutable notebook and puts in state", () => {
    const initialState = {
      app: [],
      document: initialDocument
    };
    const notebook = fromJS(dummyJSON);
    const state = reducers(initialState, {
      type: constants.SET_NOTEBOOK,
      notebook
    });
    expect(state.document.getIn(["notebook", "nbformat"])).to.equal(4);
  });
});

describe("setLanguageInfo", () => {
  it("adds the metadata fields for the kernelspec and kernel_info", () => {
    const initialState = {
      app: [],
      document: initialDocument
    };
    const kernelInfo = {
      name: "french",
      spec: {
        language: "french",
        display_name: "français"
      }
    };
    const state = reducers(initialState, {
      type: constants.SET_KERNEL_INFO,
      kernelInfo
    });
    const metadata = state.document.getIn(["notebook", "metadata"]);
    expect(metadata.getIn(["kernel_info", "name"])).to.equal("french");
    expect(metadata.getIn(["kernelspec", "name"])).to.equal("french");
    expect(metadata.getIn(["kernelspec", "display_name"])).to.equal("français");
  });
});

describe("focusCell", () => {
  it("should set cellFocused to the appropriate cell ID", () => {
    const originalState = {
      document: monocellDocument
    };

    const id = originalState.document.getIn(["notebook", "cellOrder"]).last();

    const action = {
      type: constants.FOCUS_CELL,
      id
    };

    const state = reducers(originalState, action);
    expect(state.document.get("cellFocused")).to.equal(id);
  });
});

describe("focusNextCell", () => {
  it("should focus the next cell if not the last cell", () => {
    const originalState = {
      document: monocellDocument
    };

    const id = originalState.document.getIn(["notebook", "cellOrder"]).first();

    const action = {
      type: constants.FOCUS_NEXT_CELL,
      id
    };

    const state = reducers(originalState, action);
    expect(state.document.get("cellFocused")).to.not.be.null;
  });
  it("should return same state if last cell and createCellIfUndefined is false", () => {
    const originalState = {
      document: monocellDocument
    };

    const id = originalState.document.getIn(["notebook", "cellOrder"]).last();

    const action = {
      type: constants.FOCUS_NEXT_CELL,
      id
    };

    const state = reducers(originalState, action);
    expect(state.document.get("cellFocused")).to.not.be.null;
    expect(state.document.getIn(["notebook", "cellOrder"]).size).to.equal(3);
  });
  it("should create and focus a new code cell if last cell and last cell is code cell", () => {
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

    expect(state.document.cellFocused).to.not.be.null;
    expect(state.document.getIn(["notebook", "cellOrder"]).size).to.equal(4);
    expect(newCellType).to.equal("code");
  });
  it("should create and focus a new markdown cell if last cell and last cell is markdown cell", () => {
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

    expect(state.document.cellFocused).to.not.be.null;
    expect(state.document.getIn(["notebook", "cellOrder"]).size).to.equal(4);
    expect(newCellType).to.equal("markdown");
  });
});

describe("focusPreviousCell", () => {
  it("should focus the previous cell", () => {
    const originalState = {
      document: initialDocument.set("notebook", dummyCommutable)
    };

    const id = originalState.document.getIn(["notebook", "cellOrder"]).last();
    const previousId = originalState.document
      .getIn(["notebook", "cellOrder"])
      .first();

    const action = {
      type: constants.FOCUS_PREVIOUS_CELL,
      id
    };

    const state = reducers(originalState, action);
    expect(state.document.get("cellFocused")).to.equal(previousId);
  });
});

describe("focusCellEditor", () => {
  it("should set editorFocused to the appropriate cell ID", () => {
    const originalState = {
      document: monocellDocument
    };

    const id = originalState.document.getIn(["notebook", "cellOrder"]).last();

    const action = {
      type: constants.FOCUS_CELL_EDITOR,
      id
    };

    const state = reducers(originalState, action);
    expect(state.document.get("editorFocused")).to.equal(id);
  });
});

describe("focusNextCellEditor", () => {
  it("should focus the editor of the next cell", () => {
    const originalState = {
      document: monocellDocument
    };

    const id = originalState.document.getIn(["notebook", "cellOrder"]).first();

    const action = {
      type: constants.FOCUS_NEXT_CELL_EDITOR,
      id
    };

    const state = reducers(originalState, action);
    expect(state.document.get("editorFocused")).to.not.be.null;
  });
});

describe("focusPreviousCellEditor", () => {
  it("should focus the editor of the previous cell", () => {
    const originalState = {
      document: initialDocument.set("notebook", dummyCommutable)
    };

    const id = originalState.document.getIn(["notebook", "cellOrder"]).last();
    const previousId = originalState.document
      .getIn(["notebook", "cellOrder"])
      .first();

    const action = {
      type: constants.FOCUS_PREVIOUS_CELL_EDITOR,
      id
    };

    const state = reducers(originalState, action);
    expect(state.document.get("editorFocused")).to.equal(previousId);
  });
});

describe("toggleStickyCell", () => {
  it("should stick the cell given its ID", () => {
    const doc = initialDocument
      .set("notebook", dummyCommutable)
      .set("stickyCells", new Set());
    const originalState = {
      document: doc
    };

    const id = originalState.document.getIn(["notebook", "cellOrder"]).first();

    const action = {
      type: constants.TOGGLE_STICKY_CELL,
      id
    };

    const state = reducers(originalState, action);
    expect(state.document.hasIn(["stickyCells", id])).to.be.true;
  });
  it("should unstick a stuck cell given its ID", () => {
    const id = dummyCommutable.get("cellOrder").first();
    const doc = initialDocument
      .set("notebook", dummyCommutable)
      .set("stickyCells", new Set([id]));

    const originalState = {
      document: doc
    };

    const action = {
      type: constants.TOGGLE_STICKY_CELL,
      id
    };

    const state = reducers(originalState, action);
    expect(state.document.hasIn(["stickyCells", id])).to.be.false;
  });
});

describe("updateExecutionCount", () => {
  it("updates the execution count by id", () => {
    const originalState = {
      document: monocellDocument
    };

    const id = originalState.document.getIn(["notebook", "cellOrder"]).last();

    const action = {
      type: constants.UPDATE_CELL_EXECUTION_COUNT,
      id,
      count: 42
    };

    const state = reducers(originalState, action);
    expect(
      state.document.getIn(["notebook", "cellMap", id, "execution_count"])
    ).to.equal(42);
  });
});

describe("moveCell", () => {
  it("should swap the first and last cell appropriately", () => {
    const originalState = {
      document: initialDocument.set("notebook", dummyCommutable)
    };

    const cellOrder = originalState.document.getIn(["notebook", "cellOrder"]);
    const id = cellOrder.last();
    const destinationId = cellOrder.first();

    const action = {
      type: constants.MOVE_CELL,
      id,
      destinationId
    };

    const state = reducers(originalState, action);
    expect(state.document.getIn(["notebook", "cellOrder"]).last()).to.equal(id);
    expect(state.document.getIn(["notebook", "cellOrder"]).first()).to.equal(
      destinationId
    );
  });
  it("should move a cell above another when asked", () => {
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
    expect(state.document.getIn(["notebook", "cellOrder"]).last()).to.equal(
      destinationId
    );
    expect(state.document.getIn(["notebook", "cellOrder"]).first()).to.equal(
      id
    );
  });
  it("should move a cell above another when asked", () => {
    const originalState = reducers(
      {
        document: initialDocument.set("notebook", dummyCommutable)
      },
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
      // implicitly above: false
    };

    const state = reducers(originalState, action);
    expect(
      state.document.getIn(["notebook", "cellOrder"]).toJS()
    ).to.deep.equal([cellOrder.get(1), cellOrder.get(0), cellOrder.get(2)]);

    const action2 = {
      type: constants.MOVE_CELL,
      id: cellOrder.get(0),
      destinationId: cellOrder.get(1),
      above: true
    };

    const state2 = reducers(originalState, action2);
    expect(
      state2.document.getIn(["notebook", "cellOrder"]).toJS()
    ).to.deep.equal([cellOrder.get(0), cellOrder.get(1), cellOrder.get(2)]);
  });
});

describe("removeCell", () => {
  it("should remove a cell given an ID", () => {
    const originalState = {
      document: monocellDocument
    };

    const id = originalState.document.getIn(["notebook", "cellOrder"]).first();

    const action = {
      type: constants.REMOVE_CELL,
      id
    };

    const state = reducers(originalState, action);
    expect(state.document.getIn(["notebook", "cellOrder"]).size).to.equal(2);
  });
});

describe("clearOutputs", () => {
  it("should clear outputs list", () => {
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

    const action = {
      type: constants.CLEAR_OUTPUTS,
      id
    };

    const state = reducers(originalState, action);
    const outputs = state.document.getIn([
      "notebook",
      "cellMap",
      id,
      "outputs"
    ]);
    expect(outputs).to.equal(List.of());
  });
  it("doesn't clear outputs on markdown cells", () => {
    const originalState = {
      document: initialDocument.set(
        "notebook",
        appendCellToNotebook(dummyCommutable, emptyMarkdownCell)
      )
    };

    const id = originalState.document.getIn(["notebook", "cellOrder"]).last();

    const action = {
      type: constants.CLEAR_OUTPUTS,
      id
    };

    const state = reducers(originalState, action);
    const outputs = state.document.getIn([
      "notebook",
      "cellMap",
      id,
      "outputs"
    ]);
    expect(outputs).to.be.undefined;
  });
});

describe("newCellAfter", () => {
  it("creates a brand new cell after the given id", () => {
    const originalState = {
      document: monocellDocument
    };
    const id = originalState.document.getIn(["notebook", "cellOrder"]).last();

    const action = {
      type: constants.NEW_CELL_AFTER,
      id,
      cellType: "markdown"
    };

    const state = reducers(originalState, action);
    expect(state.document.getIn(["notebook", "cellOrder"]).size).to.equal(4);
    const cellID = state.document.getIn(["notebook", "cellOrder"]).last();
    const cell = state.document.getIn(["notebook", "cellMap", cellID]);
    expect(cell.get("cell_type")).to.equal("markdown");
  });
});

describe("newCellBefore", () => {
  it("creates a new cell after the given id", () => {
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
    expect(state.document.getIn(["notebook", "cellOrder"]).size).to.equal(3);
    expect(state.document.getIn(["notebook", "cellOrder"]).last()).to.equal(id);
  });
});

describe("mergeCellAfter", () => {
  it("merges cells appropriately", () => {
    const originalState = {
      document: initialDocument.set("notebook", dummyCommutable)
    };

    const id = originalState.document.getIn(["notebook", "cellOrder"]).first();
    const action = {
      type: constants.MERGE_CELL_AFTER,
      id
    };

    const state = reducers(originalState, action);
    expect(state.document.getIn(["notebook", "cellOrder"]).size).to.equal(1);
    expect(state.document.getIn(["notebook", "cellOrder"]).first()).to.equal(
      id
    );
  });
  it("should do nothing if merging the last cell", () => {
    const originalState = {
      document: initialDocument.set("notebook", dummyCommutable)
    };

    const id = originalState.document.getIn(["notebook", "cellOrder"]).last();
    const action = {
      type: constants.MERGE_CELL_AFTER,
      id
    };

    const state = reducers(originalState, action);
    expect(state.document).to.deep.equal(originalState.document);
  });
});

describe("newCellAppend", () => {
  it("appends a new code cell at the end", () => {
    const originalState = {
      document: initialDocument.set("notebook", dummyCommutable)
    };

    const action = {
      type: constants.NEW_CELL_APPEND,
      cellType: "code"
    };

    const state = reducers(originalState, action);
    expect(state.document.getIn(["notebook", "cellOrder"]).size).to.equal(3);
  });
});

describe("updateSource", () => {
  it("updates the source of the cell", () => {
    const originalState = {
      document: initialDocument.set("notebook", dummyCommutable)
    };

    const id = originalState.document.getIn(["notebook", "cellOrder"]).first();

    const action = {
      type: constants.UPDATE_CELL_SOURCE,
      id,
      source: "This is a test"
    };

    const state = reducers(originalState, action);
    expect(
      state.document.getIn(["notebook", "cellMap", id, "source"])
    ).to.equal("This is a test");
  });
});

describe("overwriteMetadata", () => {
  it("overwrites notebook metadata appropriately", () => {
    const originalState = {
      document: monocellDocument
    };

    const action = {
      type: constants.OVERWRITE_METADATA_FIELD,
      field: "name",
      value: "javascript"
    };

    const state = reducers(originalState, action);
    expect(state.document.getIn(["notebook", "metadata", "name"])).to.equal(
      "javascript"
    );
  });
});

describe("deleteMetadata", () => {
  it("deletes notebook metadata appropriately", () => {
    const originalState = {
      document: monocellDocument.setIn(
        ["notebook", "metadata", "name"],
        "johnwashere"
      )
    };
    const action = {
      type: constants.DELETE_METADATA_FIELD,
      field: "name"
    };
    const state = reducers(originalState, action);
    expect(state.document.getIn(["notebook", "metadata", "name"])).to.equal(
      undefined
    );
  });
});

describe("changeOutputVisibility", () => {
  it("changes the visibility on a single cell", () => {
    const originalState = {
      document: monocellDocument.updateIn(["notebook", "cellMap"], cells =>
        cells.map(value => value.setIn(["metadata", "outputHidden"], false))
      )
    };

    const id = originalState.document.getIn(["notebook", "cellOrder"]).first();

    const action = {
      type: constants.CHANGE_OUTPUT_VISIBILITY,
      id
    };

    const state = reducers(originalState, action);
    expect(
      state.document.getIn([
        "notebook",
        "cellMap",
        id,
        "metadata",
        "outputHidden"
      ])
    ).to.be.true;
  });
});

describe("changeInputVisibility", () => {
  it("changes the input visibility on a single cell", () => {
    const originalState = {
      document: monocellDocument.updateIn(["notebook", "cellMap"], cells =>
        cells.map(value => value.setIn(["metadata", "inputHidden"], false))
      )
    };

    const id = originalState.document.getIn(["notebook", "cellOrder"]).first();

    const action = {
      type: constants.CHANGE_INPUT_VISIBILITY,
      id
    };

    const state = reducers(originalState, action);
    expect(
      state.document.getIn([
        "notebook",
        "cellMap",
        id,
        "metadata",
        "inputHidden"
      ])
    ).to.be.true;
  });
});

describe("clearOutputs", () => {
  it("clears out cell outputs", () => {
    const originalState = {
      document: monocellDocument
    };

    const id = originalState.document.getIn(["notebook", "cellOrder"]).last();

    const action = {
      type: constants.CLEAR_OUTPUTS,
      id
    };

    const state = reducers(originalState, action);
    expect(
      state.document.getIn(["notebook", "cellMap", id, "outputs"]).count()
    ).to.equal(0);
  });
});

describe("updateCellPagers", () => {
  it("updates cell pagers", () => {
    const originalState = {
      document: monocellDocument
    };

    const id = originalState.document.getIn(["notebook", "cellOrder"]).first();

    const action = {
      type: constants.UPDATE_CELL_PAGERS,
      id,
      pagers: "Test pagers"
    };

    const state = reducers(originalState, action);
    expect(state.document.getIn(["cellPagers", id])).to.equal("Test pagers");
  });
});

describe("updateCellStatus", () => {
  it("updates cell status", () => {
    const originalState = {
      document: monocellDocument
    };

    const id = originalState.document.getIn(["notebook", "cellOrder"]).first();

    const action = {
      type: constants.UPDATE_CELL_STATUS,
      id,
      status: "test status"
    };

    const state = reducers(originalState, action);
    expect(
      state.document.getIn(["transient", "cellMap", id, "status"])
    ).to.equal("test status");
  });
});

describe("setLanguageInfo", () => {
  it("sets the language object", () => {
    const originalState = {
      document: monocellDocument
    };

    const action = {
      type: constants.SET_LANGUAGE_INFO,
      langInfo: "test"
    };

    const state = reducers(originalState, action);
    expect(
      state.document.getIn(["notebook", "metadata", "language_info"])
    ).to.equal("test");
  });
});

describe("copyCell", () => {
  it("copies a cell", () => {
    const originalState = {
      document: monocellDocument
    };

    const id = originalState.document.getIn(["notebook", "cellOrder"]).first();
    const cell = originalState.document.getIn(["notebook", "cellMap", id]);

    const action = {
      type: constants.COPY_CELL,
      id
    };

    const state = reducers(originalState, action);
    expect(state.document.getIn(["copied", "cell"])).to.equal(cell);
    expect(state.document.getIn(["copied", "id"])).to.equal(id);
  });
});

describe("cutCell", () => {
  it("cuts a cell", () => {
    const originalState = {
      document: monocellDocument
    };

    const id = originalState.document.getIn(["notebook", "cellOrder"]).first();
    const cell = originalState.document.getIn(["notebook", "cellMap", id]);

    const action = {
      type: constants.CUT_CELL,
      id
    };

    const state = reducers(originalState, action);
    expect(state.document.getIn(["copied", "cell"])).to.equal(cell);
    expect(state.document.getIn(["copied", "id"])).to.equal(id);
    expect(state.document.getIn(["notebook", "cellMap", id])).to.be.undefined;
  });
});

describe("pasteCell", () => {
  it("pastes a cell", () => {
    const id = monocellDocument.getIn(["notebook", "cellOrder"]).first();
    const cell = monocellDocument.getIn(["notebook", "cellMap", id]);

    const originalState = {
      document: monocellDocument.set("copied", new Map({ cell, id }))
    };

    const action = {
      type: constants.PASTE_CELL
    };

    const state = reducers(originalState, action);
    const copiedId = state.document.getIn(["notebook", "cellOrder", 1]);

    expect(state.document.getIn(["notebook", "cellOrder"]).size).to.equal(4);
    expect(copiedId).to.not.equal(id);
    expect(
      state.document.getIn(["notebook", "cellMap", copiedId, "source"])
    ).to.equal(cell.get("source"));
  });
});

describe("changeCellType", () => {
  it("converts code cell to markdown cell", () => {
    const originalState = {
      document: monocellDocument
    };

    const id = monocellDocument.getIn(["notebook", "cellOrder"]).last();

    const action = {
      type: constants.CHANGE_CELL_TYPE,
      id,
      to: "markdown"
    };

    const state = reducers(originalState, action);

    expect(
      state.document.getIn(["notebook", "cellMap", id, "cell_type"])
    ).to.equal("markdown");
  });
  it("converts markdown cell to code cell", () => {
    const originalState = {
      document: monocellDocument
    };

    const id = monocellDocument.getIn(["notebook", "cellOrder"]).first();

    const action = {
      type: constants.CHANGE_CELL_TYPE,
      id,
      to: "code"
    };

    const state = reducers(originalState, action);

    expect(
      state.document.getIn(["notebook", "cellMap", id, "cell_type"])
    ).to.equal("code");
    expect(state.document.getIn(["notebook", "cellMap", id, "outputs"])).to.not
      .be.undefined;
  });
  it("does nothing if cell type is same", () => {
    const originalState = {
      document: monocellDocument
    };

    const id = monocellDocument.getIn(["notebook", "cellOrder"]).first();

    const action = {
      type: constants.CHANGE_CELL_TYPE,
      id,
      to: "markdown"
    };

    const state = reducers(originalState, action);
    expect(state.document).to.equal(originalState.document);
  });
});

describe("toggleOutputExpansion", () => {
  it("changes outputExpanded set", () => {
    const originalState = {
      document: monocellDocument.updateIn(["notebook", "cellMap"], cells =>
        cells.map(value => value.setIn(["metadata", "outputExpanded"], false))
      )
    };

    const id = originalState.document.getIn(["notebook", "cellOrder"]).first();

    const action = {
      type: constants.TOGGLE_OUTPUT_EXPANSION,
      id
    };

    const state = reducers(originalState, action);
    expect(
      state.document.getIn([
        "notebook",
        "cellMap",
        id,
        "metadata",
        "outputExpanded"
      ])
    ).to.be.true;
  });
});
describe("appendOutput", () => {
  it("appends outputs", () => {
    const originalState = {
      document: monocellDocument
    };

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
      state.document.getIn(["notebook", "cellMap", id, "outputs"])
    ).to.deep.equal(
      Immutable.fromJS([
        {
          output_type: "display_data",
          data: { "text/html": "<marquee>wee</marquee>" }
        }
      ])
    );
    expect(
      state.document.getIn(["transient", "keyPathsForDisplays"])
    ).to.deep.equal(Immutable.Map());
  });
  it("appends output and tracks display IDs", () => {
    const originalState = {
      document: monocellDocument
    };

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
      state.document.getIn(["notebook", "cellMap", id, "outputs"])
    ).to.deep.equal(
      Immutable.fromJS([
        {
          output_type: "display_data",
          data: { "text/html": "<marquee>wee</marquee>" }
        }
      ])
    );
    expect(
      state.document.getIn(["transient", "keyPathsForDisplays", "1234"])
    ).to.deep.equal(
      Immutable.fromJS([["notebook", "cellMap", id, "outputs", 0]])
    );
  });
});

describe("updateDisplay", () => {
  it("updates all displays which use the keypath", () => {
    const originalState = {
      document: monocellDocument
    };

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
      state.document.getIn(["notebook", "cellMap", id, "outputs"])
    ).to.deep.equal(
      Immutable.fromJS([
        {
          output_type: "display_data",
          data: { "text/html": "<marquee>WOO</marquee>" }
        }
      ])
    );
  });
});

describe("cleanCellTransient", () => {
  it("cleans out keyPaths that reference a particular cell ID", () => {
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
    ).to.deep.equal(
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
    ).to.deep.equal(
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
