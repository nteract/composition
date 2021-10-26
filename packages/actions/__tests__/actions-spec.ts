import { createContentRef, createKernelRef, KernelStatus } from "@nteract/types";
import * as actionTypes from "../src";

const actions = actionTypes;

describe("unhideAll", () => {
  test("allows being called with sets defaults for outputHidden and inputHidden", () => {
    const contentRef = createContentRef();

    expect(
      actions.unhideAll({
        outputHidden: true,
        inputHidden: false,
        contentRef
      })
    ).toEqual({
      type: actionTypes.UNHIDE_ALL,
      payload: {
        outputHidden: true,
        inputHidden: false,
        contentRef
      }
    });

    expect(
      actions.unhideAll({
        outputHidden: false,
        inputHidden: true,
        contentRef
      })
    ).toEqual({
      type: actionTypes.UNHIDE_ALL,
      payload: {
        outputHidden: false,
        inputHidden: true,
        contentRef
      }
    });

    expect(
      actions.unhideAll({ outputHidden: false, inputHidden: false, contentRef })
    ).toEqual({
      type: actionTypes.UNHIDE_ALL,
      payload: {
        outputHidden: false,
        inputHidden: false,
        contentRef
      }
    });

    expect(
      actions.unhideAll({ outputHidden: true, inputHidden: true, contentRef })
    ).toEqual({
      type: actionTypes.UNHIDE_ALL,
      payload: {
        outputHidden: true,
        inputHidden: true,
        contentRef
      }
    });

    expect(actions.unhideAll({ outputHidden: false, contentRef })).toEqual({
      type: actionTypes.UNHIDE_ALL,
      payload: {
        outputHidden: false,
        inputHidden: undefined,
        contentRef
      }
    });

    expect(actions.unhideAll({ inputHidden: false, contentRef })).toEqual({
      type: actionTypes.UNHIDE_ALL,
      payload: {
        outputHidden: undefined,
        inputHidden: false,
        contentRef
      }
    });

    expect(actions.unhideAll({ contentRef })).toEqual({
      type: actionTypes.UNHIDE_ALL,
      payload: {
        outputHidden: undefined,
        inputHidden: undefined,
        contentRef
      }
    });
  });
});

describe("commOpenAction", () => {
  test("creates a COMM_OPEN action", () => {
    const message = {
      content: {
        data: "DATA",
        metadata: "0",
        comm_id: "0123",
        target_name: "daredevil",
        target_module: "murdock"
      },
      buffers: new Uint8Array(10)
    };
    const action = actions.commOpenAction(message);

    expect(action).toEqual({
      type: actionTypes.COMM_OPEN,
      data: "DATA",
      metadata: "0",
      comm_id: "0123",
      target_name: "daredevil",
      target_module: "murdock",
      buffers: new Uint8Array(10)
    });
  });
});

describe("commMessageAction", () => {
  test("creates a COMM_MESSAGE action", () => {
    const message = {
      content: { data: "DATA", comm_id: "0123" },
      buffers: new Uint8Array(10)
    };
    const action = actions.commMessageAction(message);

    expect(action).toEqual({
      type: actionTypes.COMM_MESSAGE,
      data: "DATA",
      comm_id: "0123",
      buffers: new Uint8Array(10)
    });
  });
});

describe("newNotebook", () => {
  test("creates a new notebook", () => {
    const contentRef = createContentRef();
    const kernelRef = createKernelRef();

    expect(
      actions.newNotebook({
        kernelSpec: { spec: "hokey" },
        cwd: "/tmp",
        contentRef,
        kernelRef
      })
    ).toEqual({
      type: actionTypes.NEW_NOTEBOOK,
      payload: {
        kernelSpec: { spec: "hokey" },
        cwd: "/tmp",
        contentRef,
        kernelRef
      }
    });
  });
});

describe("setExecutionState", () => {
  test("creates a SET_EXECUTION_STATE action", () => {
    const kernelRef = createKernelRef();
    expect(
      actions.setExecutionState({ kernelStatus: KernelStatus.Idle, kernelRef })
    ).toEqual({
      type: actionTypes.SET_EXECUTION_STATE,
      payload: { kernelStatus: KernelStatus.Idle, kernelRef }
    });
  });
});

describe("launchKernel", () => {
  test("creates a LAUNCH_KERNEL action", () => {
    const kernelRef = createKernelRef();
    const contentRef = createContentRef();
    expect(
      actions.launchKernel({
        kernelSpec: { spec: "hokey" },
        cwd: ".",
        kernelRef,
        contentRef,
        selectNextKernel: true
      })
    ).toEqual({
      type: actionTypes.LAUNCH_KERNEL,
      payload: {
        kernelSpec: { spec: "hokey" },
        cwd: ".",
        kernelRef,
        contentRef,
        selectNextKernel: true
      }
    });
  });
});

describe("launchKernelByName", () => {
  test("creates a LAUNCH_KERNEL_BY_NAME action", () => {
    const kernelRef = createKernelRef();
    const contentRef = createContentRef();
    expect(
      actions.launchKernelByName({
        kernelSpecName: "python2",
        cwd: ".",
        kernelRef,
        contentRef,
        selectNextKernel: false
      })
    ).toEqual({
      type: actionTypes.LAUNCH_KERNEL_BY_NAME,
      payload: {
        kernelSpecName: "python2",
        cwd: ".",
        kernelRef,
        contentRef,
        selectNextKernel: false
      }
    });
  });
});

describe("setKernelMetadata", () => {
  test("creates a SET_KERNEL_METADATA action", () => {
    const kernelInfo = { name: "japanese" };
    const contentRef = createContentRef();
    expect(actions.setKernelMetadata({ kernelInfo, contentRef })).toEqual({
      type: actionTypes.SET_KERNEL_METADATA,
      payload: {
        contentRef,
        kernelInfo: {
          name: "japanese"
        }
      }
    });
  });
});

describe("updateCellSource", () => {
  test("creates a UPDATE_CELL_SOURCE action", () => {
    const contentRef = createContentRef();
    expect(
      actions.updateCellSource({ id: "1234", value: "# test", contentRef })
    ).toEqual({
      type: "SET_IN_CELL",
      payload: {
        id: "1234",
        path: ["source"],
        value: "# test",
        contentRef
      }
    });
  });
});

describe("clearOutputs", () => {
  test("creates a CLEAR_OUTPUTS action", () => {
    const contentRef = createContentRef();
    expect(actions.clearOutputs({ id: "woo", contentRef })).toEqual({
      type: "CLEAR_OUTPUTS",
      payload: { id: "woo", contentRef }
    });
  });
});

describe("updateCellExecutionCount", () => {
  test("creates a SET_IN_CELL action with the right path", () => {
    const contentRef = createContentRef();
    expect(
      actions.updateCellExecutionCount({ id: "1234", value: 3, contentRef })
    ).toEqual({
      type: "SET_IN_CELL",
      payload: {
        id: "1234",
        contentRef,
        path: ["execution_count"],
        value: 3
      }
    });
  });
});

describe("updateCellStatus", () => {
  test("creates an UPDATE_CELL_STATUS action", () => {
    const contentRef = createContentRef();
    expect(
      actions.updateCellStatus({ id: "1234", status: "test", contentRef })
    ).toEqual({
      type: actionTypes.UPDATE_CELL_STATUS,
      payload: {
        id: "1234",
        contentRef,
        status: "test"
      }
    });
  });
});

describe("moveCell", () => {
  test("creates a MOVE_CELL action", () => {
    const contentRef = createContentRef();
    expect(
      actions.moveCell({
        id: "1234",
        destinationId: "5678",
        above: true,
        contentRef
      })
    ).toEqual({
      type: actionTypes.MOVE_CELL,
      payload: {
        id: "1234",
        contentRef,
        destinationId: "5678",
        above: true
      }
    });
  });
});

describe("deleteCell", () => {
  test("creates a DELETE_CELL action", () => {
    const contentRef = createContentRef();
    expect(actions.deleteCell({ id: "1234", contentRef })).toEqual({
      type: actionTypes.DELETE_CELL,
      payload: { id: "1234", contentRef }
    });
  });
});

describe("focusCell", () => {
  test("creates a FOCUS_CELL action", () => {
    const contentRef = createContentRef();
    expect(actions.focusCell({ id: "1234", contentRef })).toEqual({
      type: actionTypes.FOCUS_CELL,
      payload: { id: "1234", contentRef }
    });
  });
});

describe("focusNextCell", () => {
  test("creates a FOCUS_NEXT_CELL action", () => {
    const contentRef = createContentRef();
    expect(
      actions.focusNextCell({
        id: "1234",
        createCellIfUndefined: false,
        contentRef
      })
    ).toEqual({
      type: actionTypes.FOCUS_NEXT_CELL,
      payload: {
        id: "1234",
        createCellIfUndefined: false,
        contentRef
      }
    });
  });
  test("creates a FOCUS_NEXT_CELL action with cell creation flag", () => {
    const contentRef = createContentRef();
    expect(
      actions.focusNextCell({
        id: "1234",
        createCellIfUndefined: true,
        contentRef
      })
    ).toEqual({
      type: actionTypes.FOCUS_NEXT_CELL,
      payload: {
        id: "1234",
        contentRef,
        createCellIfUndefined: true
      }
    });
  });
});

describe("focusPreviousCell", () => {
  test("creates a FOCUS_PREVIOUS_CELL action", () => {
    const contentRef = createContentRef();
    expect(actions.focusPreviousCell({ id: "1234", contentRef })).toEqual({
      type: actionTypes.FOCUS_PREVIOUS_CELL,
      payload: { id: "1234", contentRef }
    });
  });
});

describe("focusCellEditor", () => {
  test("creates a FOCUS_CELL_EDITOR action", () => {
    const contentRef = createContentRef();
    expect(actions.focusCellEditor({ id: "1234", contentRef })).toEqual({
      type: actionTypes.FOCUS_CELL_EDITOR,
      payload: { id: "1234", contentRef }
    });
  });
});

describe("focusPreviousCellEditor", () => {
  test("creates a FOCUS_PREVIOUS_CELL_EDITOR action", () => {
    const contentRef = createContentRef();
    expect(actions.focusPreviousCellEditor({ id: "1234", contentRef })).toEqual(
      {
        type: actionTypes.FOCUS_PREVIOUS_CELL_EDITOR,
        payload: { id: "1234", contentRef }
      }
    );
  });
});

describe("focusNextCellEditor", () => {
  test("creates a FOCUS_NEXT_CELL_EDITOR action", () => {
    const contentRef = createContentRef();
    expect(actions.focusNextCellEditor({ id: "1234", contentRef })).toEqual({
      type: actionTypes.FOCUS_NEXT_CELL_EDITOR,
      payload: { id: "1234", contentRef }
    });
  });
});

describe("createCellBelow", () => {
  test("creates a CREATE_CELL_BELOW action with provided source string", () => {
    const contentRef = createContentRef();
    const cellType = "code";
    const id = "1234";
    const source = 'print("woo")';
    expect(
      actions.createCellBelow({ cellType, id, source, contentRef })
    ).toEqual({
      type: actionTypes.CREATE_CELL_BELOW,
      payload: { source, cellType, id, contentRef }
    });
  });
});

describe("createCellAbove", () => {
  test("creates a CREATE_CELL_ABOVE action", () => {
    const contentRef = createContentRef();
    expect(
      actions.createCellAbove({ cellType: "markdown", id: "1234", contentRef })
    ).toEqual({
      type: actionTypes.CREATE_CELL_ABOVE,
      payload: {
        cellType: "markdown",
        contentRef,
        id: "1234"
      }
    });
  });
});

describe("createCellAppend", () => {
  test("creates a CREATE_CELL_APPEND action", () => {
    const contentRef = createContentRef();
    expect(
      actions.createCellAppend({ cellType: "markdown", contentRef })
    ).toEqual({
      type: actionTypes.CREATE_CELL_APPEND,
      payload: { cellType: "markdown", contentRef }
    });
  });
});

describe("overwriteMetadataField", () => {
  test("creates an OVERWRITE_METADATA_FIELD", () => {
    const contentRef = createContentRef();
    expect(
      actions.overwriteMetadataField({
        field: "foo",
        value: {
          bar: 3
        },
        contentRef
      })
    ).toEqual({
      type: actionTypes.OVERWRITE_METADATA_FIELD,
      payload: {
        field: "foo",
        contentRef,
        value: { bar: 3 }
      }
    });
  });
});

describe("copyCell", () => {
  test("creates a COPY_CELL action", () => {
    const contentRef = createContentRef();
    expect(actions.copyCell({ id: "235", contentRef })).toEqual({
      type: actionTypes.COPY_CELL,
      payload: { id: "235", contentRef }
    });
  });
});

describe("cutCell", () => {
  test("creates a CUT_CELL action", () => {
    const contentRef = createContentRef();
    expect(actions.cutCell({ id: "235", contentRef })).toEqual({
      type: actionTypes.CUT_CELL,
      payload: { id: "235", contentRef }
    });
  });
});

describe("toggleCellOutputVisibility", () => {
  test("creates a TOGGLE_CELL_OUTPUT_VISIBILITY action", () => {
    const contentRef = createContentRef();
    expect(
      actions.toggleCellOutputVisibility({ id: "235", contentRef })
    ).toEqual({
      type: actionTypes.TOGGLE_CELL_OUTPUT_VISIBILITY,
      payload: { id: "235", contentRef }
    });
  });
});

describe("toggleCellInputVisibility", () => {
  test("creates a TOGGLE_CELL_INPUT_VISIBILITY action", () => {
    const contentRef = createContentRef();
    expect(
      actions.toggleCellInputVisibility({ id: "235", contentRef })
    ).toEqual({
      type: actionTypes.TOGGLE_CELL_INPUT_VISIBILITY,
      payload: { id: "235", contentRef }
    });
  });
});

describe("pasteCell", () => {
  test("creates a PASTE_CELL action", () => {
    const contentRef = createContentRef();
    expect(actions.pasteCell({ contentRef })).toEqual({
      type: actionTypes.PASTE_CELL,
      payload: { contentRef }
    });
  });
});

describe("changeCellType", () => {
  test("creates a CHANGE_CELL_TYPE action", () => {
    const contentRef = createContentRef();
    expect(
      actions.changeCellType({ id: "235", contentRef, to: "markdown" })
    ).toEqual({
      type: actionTypes.CHANGE_CELL_TYPE,
      payload: {
        id: "235",
        contentRef,
        to: "markdown"
      }
    });
  });
});

describe("updateOutputMetadata", () => {
  test("creates a UPDATE_OUTPUT_METADATA action", () => {
    const contentRef = createContentRef();
    expect(
      actions.updateOutputMetadata({
        id: "235",
        contentRef,
        metadata: { meta: "data" },
        index: 0
      })
    ).toEqual({
      type: actionTypes.UPDATE_OUTPUT_METADATA,
      payload: {
        id: "235",
        contentRef,
        metadata: { meta: "data" },
        index: 0
      }
    });
  });
});

describe("setGithubToken", () => {
  test("creates a SET_GITHUB_TOKEN action", () => {
    expect(actions.setGithubToken({ githubToken: "token_string" })).toEqual({
      type: actionTypes.SET_GITHUB_TOKEN,
      payload: { githubToken: "token_string" }
    });
  });
});

describe("toggleOutputExpansion", () => {
  test("creates a TOGGLE_OUTPUT_EXPANSION action", () => {
    const contentRef = createContentRef();
    expect(actions.toggleOutputExpansion({ id: "235", contentRef })).toEqual({
      type: actionTypes.TOGGLE_OUTPUT_EXPANSION,
      payload: { id: "235", contentRef }
    });
  });
});

describe("save", () => {
  test("creates a SAVE action", () => {
    const contentRef = createContentRef();
    expect(actions.save({ contentRef })).toEqual({
      type: actionTypes.SAVE,
      payload: { contentRef }
    });
  });

  test("creates a SAVE_AS action", () => {
    const contentRef = createContentRef();
    expect(actions.saveAs({ filepath: "foo.ipynb", contentRef })).toEqual({
      type: actionTypes.SAVE_AS,
      payload: { filepath: "foo.ipynb", contentRef }
    });
  });

  test("creates a SAVE_FAILED action", () => {
    const contentRef = createContentRef();
    const error = new Error("fake");
    expect(actions.saveFailed({ error, contentRef })).toEqual({
      type: actionTypes.SAVE_FAILED,
      error: true,
      payload: { error, contentRef }
    });
  });

  test("creates a SAVE_FULFILLED action", () => {
    const contentRef = createContentRef();
    const model = { fake: true };
    expect(actions.saveFulfilled({ contentRef, model })).toEqual({
      type: actionTypes.SAVE_FULFILLED,
      payload: { contentRef, model: { fake: true } }
    });
  });

  test("creates a CLOSE_NOTEBOOK action", () => {
    const contentRef = createContentRef();
    expect(actions.closeNotebook({ contentRef })).toEqual({
      type: actionTypes.CLOSE_NOTEBOOK,
      payload: { contentRef }
    });
  });

  test("creates a DISPOSE_CONTENT action", () => {
    const contentRef = createContentRef();
    expect(actions.disposeContent({ contentRef })).toEqual({
      type: actionTypes.DISPOSE_CONTENT,
      payload: { contentRef }
    });
  });

  test("creates a DISPOSE_KERNEL action", () => {
    const kernelRef = createKernelRef();
    expect(actions.disposeKernel({ kernelRef })).toEqual({
      type: actionTypes.DISPOSE_KERNEL,
      payload: { kernelRef }
    });
  });
});
