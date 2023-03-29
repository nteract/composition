/* eslint-disable max-len */

import {
  appendCellToNotebook,
  emptyCodeCell,
  emptyMarkdownCell,
  emptyNotebook,
  makeDisplayData,
  makeErrorOutput,
  makeExecuteResult,
  makeStreamOutput,
} from "@nteract/commutable";
import * as Immutable from "immutable";
import { v4 as uuidv4 } from "uuid";

import * as actions from "@nteract/actions";
import { fixtureCommutable } from "@nteract/fixtures";
import { makeDocumentRecord } from "@nteract/types";
import {
  cleanCellTransient,
  notebook as reducers,
  reduceOutputs,
} from "../../../../src/core/entities/contents/notebook";

const initialDocument = Immutable.Map();
const monocellDocument = initialDocument
  .set("notebook", appendCellToNotebook(fixtureCommutable, emptyCodeCell))
  .set("transient", Immutable.Map({ keyPathsForDisplays: Immutable.Map() }));

const firstCellId = monocellDocument.getIn(["notebook", "cellOrder"]).first();

describe("reduceOutputs", () => {
  test("puts new outputs at the end by default", () => {
    const outputs = Immutable.List([
      makeStreamOutput({ output_type: "stream", name: "stdout", text: "Woo" }),
      makeErrorOutput({
        output_type: "error",
        ename: "well",
        evalue: "actually",
        traceback: Immutable.List(),
      }),
    ]);
    const newOutputs = reduceOutputs(outputs, {
      output_type: "display_data",
      data: {},
      metadata: {},
    });

    expect(newOutputs).toEqual(
      Immutable.List([
        makeStreamOutput({
          output_type: "stream",
          name: "stdout",
          text: "Woo",
        }),
        makeErrorOutput({
          output_type: "error",
          ename: "well",
          evalue: "actually",
          traceback: Immutable.List(),
        }),
        makeDisplayData({
          output_type: "display_data",
          data: {},
          metadata: Immutable.Map(),
        }),
      ])
    );
  });

  test("handles the case of a single stream output", () => {
    const outputs = Immutable.List([
      makeStreamOutput({ name: "stdout", text: "hello" }),
    ]);
    const newOutputs = reduceOutputs(outputs, {
      name: "stdout",
      text: " world",
      output_type: "stream",
    });

    expect(newOutputs).toEqual(
      Immutable.List([
        makeStreamOutput({
          name: "stdout",
          text: "hello world",
          output_type: "stream",
        }),
      ])
    );
  });

  test("merges streams of text", () => {
    let outputs = Immutable.List();

    outputs = reduceOutputs(outputs, {
      name: "stdout",
      text: "hello",
      output_type: "stream",
    });

    expect(outputs).toEqual(
      Immutable.List([makeStreamOutput({ name: "stdout", text: "hello" })])
    );

    outputs = reduceOutputs(outputs, {
      name: "stdout",
      text: " world",
      output_type: "stream",
    });
    expect(outputs).toEqual(
      Immutable.List([
        makeStreamOutput({ name: "stdout", text: "hello world" }),
      ])
    );
  });

  test("keeps respective streams together", () => {
    const outputs = Immutable.List([
      makeStreamOutput({
        name: "stdout",
        text: "hello",
        output_type: "stream",
      }),
      makeStreamOutput({
        name: "stderr",
        text: "errors are",
        output_type: "stream",
      }),
    ]);

    const newOutputs = reduceOutputs(outputs, {
      name: "stdout",
      text: " world",
      output_type: "stream",
    });

    expect(newOutputs).toEqual(
      Immutable.List([
        makeStreamOutput({
          name: "stdout",
          text: "hello world",
          output_type: "stream",
        }),
        makeStreamOutput({
          name: "stderr",
          text: "errors are",
          output_type: "stream",
        }),
      ])
    );

    const evenNewerOutputs = reduceOutputs(newOutputs, {
      name: "stderr",
      text: " informative",
      output_type: "stream",
    });
    expect(evenNewerOutputs).toEqual(
      Immutable.fromJS([
        makeStreamOutput({
          name: "stdout",
          text: "hello world",
        }),
        makeStreamOutput({
          name: "stderr",
          text: "errors are informative",
        }),
      ])
    );
  });
});

describe("setNotebookCheckpoint", () => {
  test("stores saved notebook", () => {
    const state = reducers(initialDocument, actions.saveFulfilled({}));
    expect(state.get("notebook")).toEqual(state.get("savedNotebook"));
  });
});

describe("setLanguageInfo", () => {
  test("adds the metadata fields for the kernelspec and kernel_info", () => {
    const kernelInfo = {
      name: "french",
      language: "french",
      displayName: "français",
    };
    const state = reducers(
      initialDocument,
      actions.setKernelMetadata({ kernelInfo })
    );
    const metadata = state.getIn(["notebook", "metadata"]);
    expect(metadata.getIn(["kernel_info", "name"])).toBe("french");
    expect(metadata.getIn(["kernelspec", "name"])).toBe("french");
    expect(metadata.getIn(["kernelspec", "display_name"])).toBe("français");
  });
});

describe("focusCell", () => {
  test("should set cellFocused to the appropriate cell ID", () => {
    const id = monocellDocument.getIn(["notebook", "cellOrder"]).last();
    const state = reducers(monocellDocument, actions.focusCell({ id }));
    expect(state.get("cellFocused")).toBe(id);
  });
});

describe("focusNextCell", () => {
  test("should focus the next cell if not the last cell", () => {
    const originalState = monocellDocument;

    const id = originalState.getIn(["notebook", "cellOrder"]).first();
    const state = reducers(
      originalState,
      actions.focusNextCell({ id, createCellIfUndefined: false })
    );
    expect(state.get("cellFocused")).not.toBeNull();
  });
  test("should return same state if last cell and createCellIfUndefined is false", () => {
    const originalState = monocellDocument;

    const id = originalState.getIn(["notebook", "cellOrder"]).last();
    const state = reducers(
      originalState,
      actions.focusNextCell({ id, createCellIfUndefined: false })
    );
    expect(state.get("cellFocused")).not.toBeNull();
    expect(state.getIn(["notebook", "cellOrder"]).size).toBe(3);
  });
  test("should create and focus a new code cell if last cell and last cell is code cell", () => {
    const originalState = monocellDocument.set(
      "notebook",
      appendCellToNotebook(fixtureCommutable, emptyCodeCell)
    );

    const id = originalState.getIn(["notebook", "cellOrder"]).last();
    const state = reducers(
      originalState,
      actions.focusNextCell({ id, createCellIfUndefined: true })
    );
    const newCellId = state.getIn(["notebook", "cellOrder"]).last();
    const newCellType = state.getIn([
      "notebook",
      "cellMap",
      newCellId,
      "cell_type",
    ]);

    expect(state.cellFocused).not.toBeNull();
    expect(state.getIn(["notebook", "cellOrder"]).size).toBe(4);
    expect(newCellType).toBe("code");
  });
  test("should create and focus a new markdown cell if last cell and last cell is markdown cell", () => {
    const originalState = monocellDocument.set(
      "notebook",
      appendCellToNotebook(fixtureCommutable, emptyMarkdownCell)
    );

    const id = originalState.getIn(["notebook", "cellOrder"]).last();
    const state = reducers(
      originalState,
      actions.focusNextCell({ id, createCellIfUndefined: true })
    );
    const newCellId = state.getIn(["notebook", "cellOrder"]).last();
    const newCellType = state.getIn([
      "notebook",
      "cellMap",
      newCellId,
      "cell_type",
    ]);

    expect(state.cellFocused).not.toBeNull();
    expect(state.getIn(["notebook", "cellOrder"]).size).toBe(4);
    expect(newCellType).toBe("markdown");
  });
});

describe("focusPreviousCell", () => {
  test("should focus the previous cell", () => {
    const originalState = initialDocument.set("notebook", fixtureCommutable);

    const id = originalState.getIn(["notebook", "cellOrder"]).last();
    const previousId = originalState.getIn(["notebook", "cellOrder"]).first();
    const state = reducers(originalState, actions.focusPreviousCell({ id }));
    expect(state.get("cellFocused")).toBe(previousId);
  });
});

describe("focusCellEditor", () => {
  test("should set editorFocused to the appropriate cell ID", () => {
    const originalState = monocellDocument;
    const id = originalState.getIn(["notebook", "cellOrder"]).last();
    const state = reducers(originalState, actions.focusCellEditor({ id }));
    expect(state.get("editorFocused")).toBe(id);
  });
});

describe("focusNextCellEditor", () => {
  test("should focus the editor of the next cell", () => {
    const originalState = monocellDocument;

    const id = originalState.getIn(["notebook", "cellOrder"]).first();
    const state = reducers(originalState, actions.focusNextCellEditor({ id }));
    expect(state.get("editorFocused")).not.toBeNull();
  });
});

describe("focusPreviousCellEditor", () => {
  test("should focus the editor of the previous cell", () => {
    const originalState = initialDocument.set("notebook", fixtureCommutable);

    const id = originalState.getIn(["notebook", "cellOrder"]).last();
    const previousId = originalState.getIn(["notebook", "cellOrder"]).first();
    const state = reducers(
      originalState,
      actions.focusPreviousCellEditor({ id })
    );
    expect(state.get("editorFocused")).toBe(previousId);
  });
});

describe("updateExecutionCount", () => {
  test("updates the execution count by id", () => {
    const originalState = monocellDocument;

    const id = originalState.getIn(["notebook", "cellOrder"]).last();
    const state = reducers(
      originalState,
      actions.setInCell({ id, path: ["execution_count"], value: 42 })
    );
    expect(state.getIn(["notebook", "cellMap", id, "execution_count"])).toBe(
      42
    );
  });
});

describe("moveCell", () => {
  test("should swap the first and last cell appropriately", () => {
    const originalState = initialDocument.set("notebook", fixtureCommutable);

    const cellOrder = originalState.getIn(["notebook", "cellOrder"]);
    const id = cellOrder.last();
    const destinationId = cellOrder.first();
    const state = reducers(
      originalState,
      actions.moveCell({ id, destinationId, above: false })
    );
    expect(state.getIn(["notebook", "cellOrder"]).last()).toBe(id);
    expect(state.getIn(["notebook", "cellOrder"]).first()).toBe(destinationId);
  });
  test("should move a cell above another when asked", () => {
    const originalState = initialDocument.set("notebook", fixtureCommutable);

    const cellOrder = originalState.getIn(["notebook", "cellOrder"]);
    const id = cellOrder.last();
    const destinationId = cellOrder.first();
    const state = reducers(
      originalState,
      actions.moveCell({ id, destinationId, above: true })
    );
    expect(state.getIn(["notebook", "cellOrder"]).last()).toBe(destinationId);
    expect(state.getIn(["notebook", "cellOrder"]).first()).toBe(id);
  });
  test("should move a cell above another when asked", () => {
    const originalState = reducers(
      initialDocument.set("notebook", fixtureCommutable),
      actions.createCellBelow({
        id: fixtureCommutable.get("cellOrder").first(),
        cellType: "markdown",
        source: "# Woo\n*Yay*",
      })
    );

    const cellOrder = originalState.getIn(["notebook", "cellOrder"]);

    const state = reducers(
      originalState,
      actions.moveCell({
        id: cellOrder.get(0),
        destinationId: cellOrder.get(1),
        above: false,
      })
    );
    expect(state.getIn(["notebook", "cellOrder"]).toJS()).toEqual([
      cellOrder.get(1),
      cellOrder.get(0),
      cellOrder.get(2),
    ]);

    const state2 = reducers(
      originalState,
      actions.moveCell({
        id: cellOrder.get(0),
        destinationId: cellOrder.get(1),
        above: true,
      })
    );
    expect(state2.getIn(["notebook", "cellOrder"]).toJS()).toEqual([
      cellOrder.get(0),
      cellOrder.get(1),
      cellOrder.get(2),
    ]);
  });
});

describe("deleteCell", () => {
  test("should delete a cell given an ID", () => {
    const originalState = monocellDocument;
    const id = originalState.getIn(["notebook", "cellOrder"]).first();
    const state = reducers(originalState, actions.deleteCell({ id }));
    expect(state.getIn(["notebook", "cellOrder"]).size).toBe(2);
  });
});

describe("clearOutputs", () => {
  test("should clear outputs list", () => {
    const originalState = initialDocument
      .set(
        "notebook",
        appendCellToNotebook(
          fixtureCommutable,
          emptyCodeCell.set("outputs", ["dummy outputs"])
        )
      )
      .set(
        "transient",
        Immutable.Map({ keyPathsForDisplays: Immutable.Map() })
      );

    const id = originalState.getIn(["notebook", "cellOrder"]).last();

    const state = reducers(originalState, actions.clearOutputs({ id }));
    const outputs = state.getIn(["notebook", "cellMap", id, "outputs"]);
    expect(outputs).toBe(Immutable.List.of());
  });
  test("doesn't clear outputs on markdown cells", () => {
    const notebook = appendCellToNotebook(emptyNotebook, emptyMarkdownCell);

    const originalState = makeDocumentRecord({
      notebook,
      filename: "test.ipynb",
    });

    const id = originalState.getIn(["notebook", "cellOrder"]).last();
    const state = reducers(originalState, actions.clearOutputs({ id }));
    const outputs = state.getIn(["notebook", "cellMap", id, "outputs"]);
    expect(outputs).toBeUndefined();
  });
  test("clear prompts on code cells", () => {
    let originalState = initialDocument.set(
      "notebook",
      appendCellToNotebook(
        fixtureCommutable,
        emptyCodeCell.set("outputs", ["dummy outputs"])
      )
    );
    const id: string = originalState.getIn(["notebook", "cellOrder"]).last();
    originalState = originalState.set(
      "cellPrompts",
      Immutable.Map({
        [id]: Immutable.List([{ prompt: "Test: ", password: false }]),
      })
    );

    expect(originalState.getIn(["cellPrompts", id]).size).toBe(1);

    const state = reducers(originalState, actions.clearOutputs({ id }));
    const prompts = state.getIn(["cellPrompts", id]);
    expect(prompts.size).toBe(0);
  });
});

describe("createCellBelow", () => {
  test("creates a brand new cell after the given id", () => {
    const originalState = monocellDocument;
    const id = originalState.getIn(["notebook", "cellOrder"]).last();
    const state = reducers(
      originalState,
      actions.createCellBelow({ cellType: "markdown", id })
    );
    expect(state.getIn(["notebook", "cellOrder"]).size).toBe(4);
    const cellId = state.getIn(["notebook", "cellOrder"]).last();
    const cell = state.getIn(["notebook", "cellMap", cellId]);
    expect(cell.get("cell_type")).toBe("markdown");
  });
});

describe("createCellAbove", () => {
  test("creates a new cell before the given id", () => {
    const originalState = initialDocument.set("notebook", fixtureCommutable);
    const id = originalState.getIn(["notebook", "cellOrder"]).last();
    const state = reducers(
      originalState,
      actions.createCellAbove({ cellType: "markdown", id })
    );
    expect(state.getIn(["notebook", "cellOrder"]).size).toBe(3);
    expect(state.getIn(["notebook", "cellOrder"]).last()).toBe(id);
  });
  test("creates new cell given cell contents", () => {
    const originalState = initialDocument.set("notebook", fixtureCommutable);
    const id = originalState.getIn(["notebook", "cellOrder"]).last();
    const state = reducers(
      originalState,
      actions.createCellAbove({ cellType: "markdown", id, cell: emptyMarkdownCell.set("source", "test contents") })
    );
    expect(state.getIn(["notebook", "cellOrder"]).size).toBe(3);
    expect(state.getIn(["notebook", "cellOrder"]).last()).toBe(id);
    const insertedCellId = state.getIn(["notebook", "cellOrder", 1]);
    expect(state.getIn(["notebook", "cellMap", insertedCellId, "source"])).toEqual("test contents")
  })
});

describe("newCellAppend", () => {
  test("appends a new code cell at the end", () => {
    const originalState = initialDocument.set("notebook", fixtureCommutable);
    const state = reducers(
      originalState,
      actions.createCellAppend({ cellType: "code" })
    );
    expect(state.getIn(["notebook", "cellOrder"]).size).toBe(3);
  });
  test("appends a new cell at the end given cell contents", () => {
    const originalState = initialDocument.set("notebook", fixtureCommutable);
    const state = reducers(
      originalState,
      actions.createCellAppend({ cellType: "markdown", cell: emptyMarkdownCell.set("source", "test contents") })
    );
    expect(state.getIn(["notebook", "cellOrder"]).size).toBe(3);
    const insertedCellId = state.getIn(["notebook", "cellOrder"]).last();
    expect(state.getIn(["notebook", "cellMap", insertedCellId, "source"])).toEqual("test contents")
  });
});

describe("updateSource", () => {
  test("updates the source of the cell", () => {
    const originalState = initialDocument.set("notebook", fixtureCommutable);

    const id = originalState.getIn(["notebook", "cellOrder"]).first();
    const state = reducers(
      originalState,
      actions.setInCell({ id, path: ["source"], value: "This is a test" })
    );
    expect(state.getIn(["notebook", "cellMap", id, "source"])).toBe(
      "This is a test"
    );
  });
});

describe("overwriteMetadataField", () => {
  test("overwrites notebook metadata appropriately", () => {
    const originalState = monocellDocument;
    const state = reducers(
      originalState,
      actions.overwriteMetadataField({
        field: "name",
        value: "javascript",
      })
    );
    expect(state.getIn(["notebook", "metadata", "name"])).toBe("javascript");
  });
});

describe("deleteMetadataField", () => {
  test("deletes notebook metadata appropriately", () => {
    const originalState = monocellDocument.setIn(
      ["notebook", "metadata", "name"],
      "johnwashere"
    );
    const state = reducers(
      originalState,
      actions.deleteMetadataField({ field: "name" })
    );
    expect(state.getIn(["notebook", "metadata", "name"])).toBe(undefined);
  });
});

describe("toggleCellOutputVisibility", () => {
  test("changes the visibility on a single cell", () => {
    const originalState = monocellDocument.updateIn(
      ["notebook", "cellMap"],
      (cells) =>
        cells.map((value) =>
          value.setIn(["metadata", "jupyter", "outputs_hidden"], false)
        )
    );

    const id = originalState.getIn(["notebook", "cellOrder"]).first();
    const state = reducers(
      originalState,
      actions.toggleCellOutputVisibility({ id })
    );
    expect(
      state.getIn([
        "notebook",
        "cellMap",
        id,
        "metadata",
        "jupyter",
        "outputs_hidden",
      ])
    ).toBe(true);
  });
});

describe("toggleCellInputVisibility", () => {
  test("changes the input visibility on a single cell", () => {
    const originalState = monocellDocument.updateIn(
      ["notebook", "cellMap"],
      (cells) =>
        cells.map((value) =>
          value.setIn(["metadata", "jupyter", "source_hidden"], false)
        )
    );
    const id = originalState.getIn(["notebook", "cellOrder"]).first();
    const state = reducers(
      originalState,
      actions.toggleCellInputVisibility({
        id,
      })
    );
    expect(
      state.getIn([
        "notebook",
        "cellMap",
        id,
        "metadata",
        "jupyter",
        "source_hidden",
      ])
    ).toBe(true);
  });
});

describe("clearOutputs", () => {
  test("clears out cell outputs", () => {
    const originalState = monocellDocument;

    const id = originalState.getIn(["notebook", "cellOrder"]).last();
    const state = reducers(originalState, actions.clearOutputs({ id }));
    expect(state.getIn(["notebook", "cellMap", id, "outputs"]).count()).toBe(0);
  });
});

describe("updateCellStatus", () => {
  test("updates cell status", () => {
    const originalState = monocellDocument;

    const id = originalState.getIn(["notebook", "cellOrder"]).first();
    const state = reducers(
      originalState,
      actions.updateCellStatus({ id, status: "test status" })
    );
    expect(state.getIn(["transient", "cellMap", id, "status"])).toBe(
      "test status"
    );
  });
});

describe("copyCell", () => {
  test("copies a cell", () => {
    const firstId = uuidv4();
    const secondId = uuidv4();
    const thirdId = uuidv4();

    const originalState = makeDocumentRecord({
      notebook: Immutable.fromJS({
        cellOrder: [firstId, secondId, thirdId],
        cellMap: {
          [firstId]: emptyCodeCell.set("source", "data"),
          [secondId]: emptyCodeCell,
          [thirdId]: emptyCodeCell,
        },
      }),
      cellFocused: secondId,
      copied: null,
    });

    const state = reducers(originalState, actions.copyCell({ id: firstId }));

    expect(state.get("copied")).toEqual(emptyCodeCell.set("source", "data"));

    expect(state.get("notebook")).toEqual(
      Immutable.fromJS({
        cellOrder: [firstId, secondId, thirdId],
        cellMap: {
          [firstId]: emptyCodeCell.set("source", "data"),
          [secondId]: emptyCodeCell,
          [thirdId]: emptyCodeCell,
        },
      })
    );
  });
});

describe("cutCell", () => {
  test("cuts a cell", () => {
    const firstId = uuidv4();
    const secondId = uuidv4();
    const thirdId = uuidv4();

    const originalState = makeDocumentRecord({
      notebook: Immutable.fromJS({
        cellOrder: [firstId, secondId, thirdId],
        cellMap: {
          [firstId]: emptyCodeCell.set("source", "data"),
          [secondId]: emptyCodeCell,
          [thirdId]: emptyCodeCell,
        },
      }),
      cellFocused: secondId,
      copied: null,
    });

    const state = reducers(originalState, actions.cutCell({ id: firstId }));

    expect(state.get("copied")).toEqual(emptyCodeCell.set("source", "data"));
    expect(state.getIn(["notebook", "cellMap", firstId])).toBeUndefined();
  });
});

describe("pasteCell", () => {
  test("pastes a cell", () => {
    const firstId = uuidv4();
    const secondId = uuidv4();
    const thirdId = uuidv4();

    const originalState = makeDocumentRecord({
      notebook: Immutable.fromJS({
        cellOrder: [firstId, secondId, thirdId],
        cellMap: {
          [firstId]: emptyCodeCell,
          [secondId]: emptyCodeCell,
          [thirdId]: emptyCodeCell,
        },
      }),
      cellFocused: secondId,
      copied: emptyCodeCell.set("source", "COPY PASTA"),
    });

    // We will paste the cell after the focused cell
    const state = reducers(originalState, actions.pasteCell({}));

    // The third cell should be our copied cell
    const newCellId = state.getIn(["notebook", "cellOrder", 2]);
    expect(state.getIn(["notebook", "cellMap", newCellId])).toEqual(
      emptyCodeCell.set("source", "COPY PASTA")
    );

    expect(state.getIn(["notebook", "cellOrder"])).toEqual(
      Immutable.List([firstId, secondId, newCellId, thirdId])
    );

    // Ensure it's a new cell
    expect(
      Immutable.Set([firstId, secondId, thirdId]).has(newCellId)
    ).toBeFalsy();
  });
});

describe("changeCellType", () => {
  test("converts code cell to markdown cell", () => {
    const originalState = monocellDocument;
    const id = monocellDocument.getIn(["notebook", "cellOrder"]).last();
    const state = reducers(
      originalState,
      actions.changeCellType({ id, to: "markdown" })
    );
    expect(state.getIn(["notebook", "cellMap", id, "cell_type"])).toBe(
      "markdown"
    );
  });
  test("converts markdown cell to code cell", () => {
    const originalState = monocellDocument;
    const id = monocellDocument.getIn(["notebook", "cellOrder"]).first();
    const state = reducers(
      originalState,
      actions.changeCellType({ id, to: "code" })
    );

    const cell = state.getIn(["notebook", "cellMap", id]);

    expect(cell.cell_type).toBe("code");
    expect(cell.outputs).toEqual(Immutable.List());
  });
  test("does nothing if cell type is same", () => {
    const originalState = monocellDocument;
    const id = monocellDocument.getIn(["notebook", "cellOrder"]).first();
    const state = reducers(
      originalState,
      actions.changeCellType({ id, to: "markdown" })
    );
    expect(state).toBe(originalState);
  });
});

describe("toggleOutputExpansion", () => {
  test("toggles value of scrolled property when it starts as 'auto'", () => {
    const originalState = monocellDocument.updateIn(
      ["notebook", "cellMap"],
      (cells) =>
        cells.map((value) => value.setIn(["metadata", "scrolled"], "auto"))
    );
    const id = originalState.getIn(["notebook", "cellOrder"]).first();
    const state2 = reducers(originalState, actions.toggleOutputExpansion({ id }));
    const state3 = reducers(state2, actions.toggleOutputExpansion({ id }));
    const state4 = reducers(state3, actions.toggleOutputExpansion({ id }));
    expect(state2.getIn(["notebook", "cellMap", id, "metadata", "scrolled"])).toBe(false);
    expect(state3.getIn(["notebook", "cellMap", id, "metadata", "scrolled"])).toBe(true);
    expect(state4.getIn(["notebook", "cellMap", id, "metadata", "scrolled"])).toBe(false);
  });
  test("toggles value of scrolled property when it starts as undefined", () => {
    const originalState = monocellDocument.updateIn(
      ["notebook", "cellMap"],
      (cells) =>
        cells.map((value) => value.setIn(["metadata", "scrolled"], undefined))
    );
    const id = originalState.getIn(["notebook", "cellOrder"]).first();
    const state2 = reducers(originalState, actions.toggleOutputExpansion({ id }));
    const state3 = reducers(state2, actions.toggleOutputExpansion({ id }));
    const state4 = reducers(state3, actions.toggleOutputExpansion({ id }));
    expect(state2.getIn(["notebook", "cellMap", id, "metadata", "scrolled"])).toBe(false);
    expect(state3.getIn(["notebook", "cellMap", id, "metadata", "scrolled"])).toBe(true);
    expect(state4.getIn(["notebook", "cellMap", id, "metadata", "scrolled"])).toBe(false);
  });
});
describe("appendOutput", () => {
  test("appends outputs", () => {
    const originalState = monocellDocument;

    const id = originalState.getIn(["notebook", "cellOrder", 2]);

    const action = actions.appendOutput({
      id,
      output: {
        output_type: "display_data",
        data: { "text/html": "<marquee>wee</marquee>" },
      },
    });

    const state = reducers(originalState, action);
    expect(state.getIn(["notebook", "cellMap", id, "outputs"])).toEqual(
      Immutable.List([
        makeDisplayData({
          output_type: "display_data",
          data: { "text/html": "<marquee>wee</marquee>" },
        }),
      ])
    );

    expect(state.getIn(["transient", "keyPathsForDisplays"])).toEqual(
      Immutable.Map()
    );
  });
  test("appends output and tracks display IDs", () => {
    const originalState = monocellDocument;

    const cellId = originalState.getIn(["notebook", "cellOrder", 2]);

    const action = actions.appendOutput({
      id: cellId,
      output: {
        output_type: "display_data",
        data: { "text/html": "<marquee>wee</marquee>" },
        transient: { display_id: "1234" },
      },
    });

    const state = reducers(originalState, action);
    expect(state.getIn(["notebook", "cellMap", cellId, "outputs"])).toEqual(
      Immutable.List([
        makeDisplayData({
          data: { "text/html": "<marquee>wee</marquee>" },
        }),
      ])
    );

    expect(state.getIn(["transient", "keyPathsForDisplays", "1234"])).toEqual(
      // we expect a list of keypaths (which are lists of strings + numbers)
      Immutable.List([
        Immutable.List(["notebook", "cellMap", cellId, "outputs", 0]),
      ])
    );
  });
});

describe("updateDisplay", () => {
  test("handles a non-existent keypath gracefully", () => {
    const originalState = monocellDocument;

    const id = originalState.getIn(["notebook", "cellOrder", 2]);

    const action = actions.updateDisplay({
      content: {
        output_type: "update_display_data",
        data: { "text/html": "🐱😼😹" },
        metadata: {},
        transient: { display_id: "1234" },
      },
      contentRef: undefined,
    });

    const state = reducers(originalState, action);

    expect(state.getIn(["notebook", "cellMap", id, "outputs"])).toEqual(
      Immutable.List([])
    );
  });

  test("updates all displays which use the keypath", () => {
    const originalState = monocellDocument;

    const id = originalState.getIn(["notebook", "cellOrder", 2]);

    const actionArray = [
      actions.appendOutput({
        id,
        output: {
          output_type: "display_data",
          data: { "text/html": "<marquee>wee</marquee>" },
          transient: { display_id: "1234" },
        },
      }),
      actions.appendOutput({
        id,
        output: {
          output_type: "execute_result",
          data: { "text/plain": "shennagins afoot" },
          transient: { display_id: "1234" },
        },
      }),
    ];

    const state = actionArray.reduce(
      (s, action) => reducers(s, action),
      originalState
    );

    expect(state.getIn(["notebook", "cellMap", id, "outputs"])).toEqual(
      Immutable.List([
        makeDisplayData({
          output_type: "display_data",
          data: { "text/plain": "shennagins afoot" },
          metadata: Immutable.Map({}),
        }),
        makeExecuteResult({
          output_type: "execute_result",
          data: { "text/plain": "shennagins afoot" },
          metadata: Immutable.Map({}),
        }),
      ])
    );

    const moreActionArray = [
      actions.updateDisplay({
        content: {
          output_type: "update_display_data",
          data: { "text/html": "<marquee>WOO</marquee>" },
          transient: { display_id: "1234" },
        },
      }),
    ];

    const moreState = moreActionArray.reduce(
      (s, action) => reducers(s, action),
      state
    );

    expect(moreState.getIn(["notebook", "cellMap", id, "outputs"])).toEqual(
      Immutable.List([
        makeDisplayData({
          output_type: "display_data",
          data: { "text/html": "<marquee>WOO</marquee>" },
          metadata: Immutable.Map({}),
        }),
        makeExecuteResult({
          output_type: "execute_result",
          data: { "text/html": "<marquee>WOO</marquee>" },
          metadata: Immutable.Map({}),
        }),
      ])
    );
  });
});

describe("cleanCellTransient", () => {
  test("cleans out keyPaths that reference a particular cell ID", () => {
    const keyPathsForDisplays = Immutable.fromJS({
      1234: [
        ["notebook", "cellMap", "0000", "outputs", 0],
        ["notebook", "cellMap", "XYZA", "outputs", 0],
        ["notebook", "cellMap", "0000", "outputs", 1],
      ],
      5678: [["notebook", "cellMap", "XYZA", "outputs", 1]],
    });
    const state = new Immutable.Map({
      transient: new Immutable.Map({
        keyPathsForDisplays,
      }),
    });

    expect(
      cleanCellTransient(state, "0000").getIn([
        "transient",
        "keyPathsForDisplays",
      ])
    ).toEqual(
      Immutable.fromJS({
        1234: [["notebook", "cellMap", "XYZA", "outputs", 0]],
        5678: [["notebook", "cellMap", "XYZA", "outputs", 1]],
      })
    );

    expect(
      cleanCellTransient(state, "XYZA").getIn([
        "transient",
        "keyPathsForDisplays",
      ])
    ).toEqual(
      Immutable.fromJS({
        1234: [
          ["notebook", "cellMap", "0000", "outputs", 0],
          ["notebook", "cellMap", "0000", "outputs", 1],
        ],
        5678: [],
      })
    );
  });
});

describe("acceptPayloadMessage", () => {
  test("processes jupyter payload message types", () => {
    const notebook = appendCellToNotebook(emptyNotebook, emptyCodeCell);
    const initialState = makeDocumentRecord({
      filename: "test.ipynb",
      notebook,
      cellPagers: Immutable.Map({}),
    });
    const state = reducers(
      initialState,
      actions.acceptPayloadMessage({
        id: firstCellId,
        payload: {
          source: "page",
          data: { well: "alright" },
        },
      })
    );

    expect(state.getIn(["cellPagers", firstCellId])).toEqual(
      Immutable.List([{ well: "alright" }])
    );

    const nextState = reducers(
      state,
      actions.acceptPayloadMessage({
        id: firstCellId,
        payload: {
          source: "set_next_input",
          replace: true,
          text: "this is now the text",
        },
      })
    );

    expect(
      nextState.getIn(["notebook", "cellMap", firstCellId, "source"])
    ).toEqual("this is now the text");
  });
});

describe("updateOutputMetadata", () => {
  test("updates the metadata of an output by cell ID & index", () => {
    const originalState = monocellDocument.set(
      "notebook",
      appendCellToNotebook(
        fixtureCommutable,
        emptyCodeCell.set("outputs", Immutable.fromJS([{ empty: "output" }]))
      )
    );

    const newOutputMetadata = Immutable.Map({ meta: "data" });

    const id: string = originalState.getIn(["notebook", "cellOrder"]).last();

    const state = reducers(
      originalState,
      actions.updateOutputMetadata({
        id,
        metadata: newOutputMetadata,
        index: 0,
        mediaType: "test/mediatype",
      })
    );
    expect(state.getIn(["notebook", "cellMap", id, "outputs", 0])).toEqual(
      Immutable.Map({
        empty: "output",
        metadata: Immutable.Map({ "test/mediatype": newOutputMetadata }),
      })
    );
  });
});

describe("interruptKernelSuccessful", () => {
  test("should do nothing for cells that are not queued or running", () => {
    const originalState = Immutable.fromJS({
      cellMap: { cell1: {}, cell2: {}, cell3: {} },
      transient: {
        cellMap: {
          cell1: { status: "" },
          cell2: { status: "" },
          cell3: { status: "" },
        },
      },
    });
    const state = reducers(
      originalState,
      actions.interruptKernelSuccessful({
        kernelRef: "testKernelRef",
        contentRef: "testContentRef",
      })
    );
    expect(state.getIn(["transient", "cellMap", "cell1", "status"])).toEqual(
      ""
    );
    expect(state.getIn(["transient", "cellMap", "cell2", "status"])).toEqual(
      ""
    );
    expect(state.getIn(["transient", "cellMap", "cell3", "status"])).toEqual(
      ""
    );
  });
  test("should reset status for cells that are queued or running", () => {
    const originalState = Immutable.fromJS({
      cellMap: { cell1: {}, cell2: {}, cell3: {} },
      transient: {
        cellMap: {
          cell1: { status: "queued" },
          cell2: { status: "running" },
          cell3: { status: "" },
        },
      },
    });
    const state = reducers(
      originalState,
      actions.interruptKernelSuccessful({
        kernelRef: "testKernelRef",
        contentRef: "testContentRef",
      })
    );
    expect(state.getIn(["transient", "cellMap", "cell1", "status"])).toEqual(
      ""
    );
    expect(state.getIn(["transient", "cellMap", "cell2", "status"])).toEqual(
      ""
    );
    expect(state.getIn(["transient", "cellMap", "cell3", "status"])).toEqual(
      ""
    );
  });
});

describe("unhideAll", () => {
  const cellOrder = [uuidv4(), uuidv4(), uuidv4(), uuidv4()];
  let initialState = Immutable.Map();

  beforeEach(() => {
    // Arrange
    initialState = initialDocument.set(
      "notebook",
      Immutable.fromJS({
        cellOrder,
        cellMap: {
          [cellOrder[0]]: emptyCodeCell
            .setIn(["metadata", "jupyter", "outputs_hidden"], false)
            .setIn(["metadata", "jupyter", "source_hidden"], false),
          [cellOrder[1]]: emptyCodeCell
            .setIn(["metadata", "jupyter", "outputs_hidden"], true)
            .setIn(["metadata", "jupyter", "source_hidden"], false),
          [cellOrder[2]]: emptyCodeCell
            .setIn(["metadata", "jupyter", "source_hidden"], false)
            .setIn(["metadata", "jupyter", "outputs_hidden"], false),
          [cellOrder[3]]: emptyCodeCell
            .setIn(["metadata", "jupyter", "source_hidden"], true)
            .setIn(["metadata", "jupyter", "outputs_hidden"], false),
        },
      })
    );
  });

  test("should reveal all inputs", () => {
    // Act
    const actualState = reducers(
      initialState,
      actions.unhideAll({
        inputHidden: false,
        contentRef: undefined,
      })
    );

    // Assert: should unhide inputs and keep outputs' visibility unchanged
    expect(
      actualState
        .getIn(["notebook", "cellMap"])
        .map((cell) => cell.getIn(["metadata", "jupyter", "source_hidden"]))
        .toList()
        .toArray()
    ).not.toContain(true);

    expect(
      actualState
        .getIn(["notebook", "cellMap"])
        .map((cell) => cell.getIn(["metadata", "jupyter", "outputs_hidden"]))
        .toList()
        .toArray()
    ).toEqual([false, true, false, false]);
  });

  test("should hide all inputs", () => {
    // Act
    const actualState = reducers(
      initialState,
      actions.unhideAll({
        inputHidden: true,
        contentRef: undefined,
      })
    );

    // Assert: should hide inputs and keep outputs' visibility unchanged
    expect(
      actualState
        .getIn(["notebook", "cellMap"])
        .map((cell) => cell.getIn(["metadata", "jupyter", "source_hidden"]))
        .toList()
        .toArray()
    ).not.toContain(false);

    expect(
      actualState
        .getIn(["notebook", "cellMap"])
        .map((cell) => cell.getIn(["metadata", "jupyter", "outputs_hidden"]))
        .toList()
        .toArray()
    ).toEqual([false, true, false, false]);
  });

  test("should reveal all outputs", () => {
    // Act
    const actualState = reducers(
      initialState,
      actions.unhideAll({
        outputHidden: false,
        contentRef: undefined,
      })
    );

    // Assert: should unhide outputs and keep inputs' visibility unchanged
    expect(
      actualState
        .getIn(["notebook", "cellMap"])
        .map((cell) => cell.getIn(["metadata", "jupyter", "outputs_hidden"]))
        .toList()
        .toArray()
    ).not.toContain(true);

    expect(
      actualState
        .getIn(["notebook", "cellMap"])
        .map((cell) => cell.getIn(["metadata", "jupyter", "source_hidden"]))
        .toList()
        .toArray()
    ).toEqual([false, false, false, true]);
  });

  test("should hide all outputs", () => {
    // Act
    const actualState = reducers(
      initialState,
      actions.unhideAll({
        outputHidden: true,
        contentRef: undefined,
      })
    );

    // Assert: should hide outputs and keep inputs' visibility unchanged
    expect(
      actualState
        .getIn(["notebook", "cellMap"])
        .map((cell) => cell.getIn(["metadata", "jupyter", "outputs_hidden"]))
        .toList()
        .toArray()
    ).not.toContain(false);

    expect(
      actualState
        .getIn(["notebook", "cellMap"])
        .map((cell) => cell.getIn(["metadata", "jupyter", "source_hidden"]))
        .toList()
        .toArray()
    ).toEqual([false, false, false, true]);
  });

  test("should reveal all inputs and outputs", () => {
    // Act
    const actualState = reducers(
      initialState,
      actions.unhideAll({
        inputHidden: false,
        outputHidden: false,
        contentRef: undefined,
      })
    );

    // Assert
    expect(
      actualState
        .getIn(["notebook", "cellMap"])
        .map((cell) => cell.getIn(["metadata", "jupyter", "source_hidden"]))
        .toList()
        .toArray()
    ).not.toContain(true);

    expect(
      actualState
        .getIn(["notebook", "cellMap"])
        .map((cell) => cell.getIn(["metadata", "jupyter", "outputs_hidden"]))
        .toList()
        .toArray()
    ).not.toContain(true);
  });

  test("should hide all inputs and outputs", () => {
    // Act
    const actualState = reducers(
      initialState,
      actions.unhideAll({
        inputHidden: true,
        outputHidden: true,
        contentRef: undefined,
      })
    );

    // Assert
    expect(
      actualState
        .getIn(["notebook", "cellMap"])
        .map((cell) => cell.getIn(["metadata", "jupyter", "source_hidden"]))
        .toList()
        .toArray()
    ).not.toContain(false);

    expect(
      actualState
        .getIn(["notebook", "cellMap"])
        .map((cell) => cell.getIn(["metadata", "jupyter", "outputs_hidden"]))
        .toList()
        .toArray()
    ).not.toContain(false);
  });

  test("should no-op", () => {
    // Act
    const actualState = reducers(
      initialState,
      actions.unhideAll({
        contentRef: undefined,
      })
    );

    // Assert: should keep all inputs' and outputs' visibility unchanged
    expect(
      actualState
        .getIn(["notebook", "cellMap"])
        .map((cell) => cell.getIn(["metadata", "jupyter", "source_hidden"]))
        .toList()
        .toArray()
    ).toEqual([false, false, false, true]);

    expect(
      actualState
        .getIn(["notebook", "cellMap"])
        .map((cell) => cell.getIn(["metadata", "jupyter", "outputs_hidden"]))
        .toList()
        .toArray()
    ).toEqual([false, true, false, false]);
  });
});
