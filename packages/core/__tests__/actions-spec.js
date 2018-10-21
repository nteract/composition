// @flow
import * as actions from "../src/actions";
import * as actionTypes from "../src/actionTypes";

describe("setLanguageInfo", () => {
  test("creates a SET_LANGUAGE_INFO action", () => {
    const langInfo = {
      codemirror_mode: { name: "ipython", version: 3 },
      file_extension: ".py",
      mimetype: "text/x-python",
      name: "python",
      nbconvert_exporter: "python",
      pygments_lexer: "ipython3",
      version: "3.5.1"
    };

    expect(actions.setLanguageInfo({ langInfo })).toEqual({
      type: actionTypes.SET_LANGUAGE_INFO,
      payload: { langInfo }
    });
  });
});

describe("unhideAll", () => {
  test("allows being called with sets defaults for outputHidden and inputHidden", () => {
    expect(
      actions.unhideAll({ outputHidden: true, inputHidden: false })
    ).toEqual({
      type: actionTypes.UNHIDE_ALL,
      payload: {
        outputHidden: true,
        inputHidden: false
      }
    });

    expect(
      actions.unhideAll({ outputHidden: false, inputHidden: true })
    ).toEqual({
      type: actionTypes.UNHIDE_ALL,
      payload: {
        outputHidden: false,
        inputHidden: true
      }
    });

    expect(
      actions.unhideAll({ outputHidden: false, inputHidden: false })
    ).toEqual({
      type: actionTypes.UNHIDE_ALL,
      payload: {
        outputHidden: false,
        inputHidden: false
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
      buffers: new Uint8Array()
    };
    const action = actions.commOpenAction(message);

    expect(action).toEqual({
      type: actionTypes.COMM_OPEN,
      data: "DATA",
      metadata: "0",
      comm_id: "0123",
      target_name: "daredevil",
      target_module: "murdock",
      buffers: new Uint8Array()
    });
  });
});

describe("commMessageAction", () => {
  test("creates a COMM_MESSAGE action", () => {
    const message = {
      content: { data: "DATA", comm_id: "0123" },
      buffers: new Uint8Array()
    };
    const action = actions.commMessageAction(message);

    expect(action).toEqual({
      type: actionTypes.COMM_MESSAGE,
      data: "DATA",
      comm_id: "0123",
      buffers: new Uint8Array()
    });
  });
});

describe("newNotebook", () => {
  test("creates a new notebook", () => {
    expect(
      actions.newNotebook({
        kernelSpec: { spec: "hokey" },
        cwd: "/tmp"
      })
    ).toEqual({
      type: actionTypes.NEW_NOTEBOOK,
      payload: {
        kernelSpec: { spec: "hokey" },
        cwd: "/tmp"
      }
    });
  });
});

describe("setExecutionState", () => {
  test("creates a SET_EXECUTION_STATE action", () => {
    expect(actions.setExecutionState({ kernelStatus: "idle" })).toEqual({
      type: actionTypes.SET_EXECUTION_STATE,
      payload: { kernelStatus: "idle" }
    });
  });
});

describe("launchKernel", () => {
  test("creates a LAUNCH_KERNEL action", () => {
    expect(
      actions.launchKernel({ kernelSpec: { spec: "hokey" }, cwd: "." })
    ).toEqual({
      type: actionTypes.LAUNCH_KERNEL,
      payload: {
        kernelSpec: { spec: "hokey" },
        cwd: "."
      }
    });
  });
});

describe("launchKernelByName", () => {
  test("creates a LAUNCH_KERNEL_BY_NAME action", () => {
    expect(
      actions.launchKernelByName({ kernelSpecName: "python2", cwd: "." })
    ).toEqual({
      type: actionTypes.LAUNCH_KERNEL_BY_NAME,
      payload: {
        kernelSpecName: "python2",
        cwd: "."
      }
    });
  });
});

describe("setKernelspecInfo", () => {
  test("creates a SET_KERNELSPEC_INFO action", () => {
    const kernelInfo = { name: "japanese" };
    expect(actions.setKernelspecInfo({ kernelInfo })).toEqual({
      type: actionTypes.SET_KERNELSPEC_INFO,
      payload: {
        kernelInfo: {
          name: "japanese"
        }
      }
    });
  });
});

describe("updateCellSource", () => {
  test("creates a UPDATE_CELL_SOURCE action", () => {
    expect(actions.updateCellSource({ id: "1234", value: "# test" })).toEqual({
      type: "SET_IN_CELL",
      payload: {
        id: "1234",
        path: ["source"],
        value: "# test"
      }
    });
  });
});

describe("clearOutputs", () => {
  test("creates a CLEAR_OUTPUTS action", () => {
    expect(actions.clearOutputs({ id: "woo" })).toEqual({
      type: "CLEAR_OUTPUTS",
      payload: { id: "woo" }
    });
  });
});

describe("updateCellExecutionCount", () => {
  test("creates a SET_IN_CELL action with the right path", () => {
    expect(actions.updateCellExecutionCount({ id: "1234", value: 3 })).toEqual({
      type: "SET_IN_CELL",
      payload: {
        id: "1234",
        path: ["execution_count"],
        value: 3
      }
    });
  });
});

describe("updateCellStatus", () => {
  test("creates an UPDATE_CELL_STATUS action", () => {
    expect(actions.updateCellStatus({ id: "1234", status: "test" })).toEqual({
      type: actionTypes.UPDATE_CELL_STATUS,
      payload: {
        id: "1234",
        status: "test"
      }
    });
  });
});

describe("moveCell", () => {
  test("creates a MOVE_CELL action", () => {
    expect(
      actions.moveCell({ id: "1234", destinationId: "5678", above: true })
    ).toEqual({
      type: actionTypes.MOVE_CELL,
      payload: {
        id: "1234",
        destinationId: "5678",
        above: true
      }
    });
  });
});

describe("deleteCell", () => {
  test("creates a DELETE_CELL action", () => {
    expect(actions.deleteCell({ id: "1234" })).toEqual({
      type: actionTypes.DELETE_CELL,
      payload: { id: "1234" }
    });
  });
});

describe("removeCell", () => {
  test("DEPRECATION WARNING:DEPRECATED. Use deleteCell() instead. creates a REMOVE_CELL action", () => {
    expect(actions.removeCell({ id: "1234" })).toEqual({
      type: actionTypes.REMOVE_CELL,
      payload: { id: "1234" }
    });
  });
});

describe("focusCell", () => {
  test("creates a FOCUS_CELL action", () => {
    expect(actions.focusCell({ id: "1234" })).toEqual({
      type: actionTypes.FOCUS_CELL,
      payload: { id: "1234" }
    });
  });
});

describe("focusNextCell", () => {
  test("creates a FOCUS_NEXT_CELL action", () => {
    expect(
      actions.focusNextCell({ id: "1234", createCellIfUndefined: false })
    ).toEqual({
      type: actionTypes.FOCUS_NEXT_CELL,
      payload: {
        id: "1234",
        createCellIfUndefined: false
      }
    });
  });
  test("creates a FOCUS_NEXT_CELL action with cell creation flag", () => {
    expect(
      actions.focusNextCell({ id: "1234", createCellIfUndefined: true })
    ).toEqual({
      type: actionTypes.FOCUS_NEXT_CELL,
      payload: {
        id: "1234",
        createCellIfUndefined: true
      }
    });
  });
});

describe("focusPreviousCell", () => {
  test("creates a FOCUS_PREVIOUS_CELL action", () => {
    expect(actions.focusPreviousCell({ id: "1234" })).toEqual({
      type: actionTypes.FOCUS_PREVIOUS_CELL,
      payload: { id: "1234" }
    });
  });
});

describe("focusCellEditor", () => {
  test("creates a FOCUS_CELL_EDITOR action", () => {
    expect(actions.focusCellEditor({ id: "1234" })).toEqual({
      type: actionTypes.FOCUS_CELL_EDITOR,
      payload: { id: "1234" }
    });
  });
});

describe("focusPreviousCellEditor", () => {
  test("creates a FOCUS_PREVIOUS_CELL_EDITOR action", () => {
    expect(actions.focusPreviousCellEditor({ id: "1234" })).toEqual({
      type: actionTypes.FOCUS_PREVIOUS_CELL_EDITOR,
      payload: { id: "1234" }
    });
  });
});

describe("focusNextCellEditor", () => {
  test("creates a FOCUS_NEXT_CELL_EDITOR action", () => {
    expect(actions.focusNextCellEditor({ id: "1234" })).toEqual({
      type: actionTypes.FOCUS_NEXT_CELL_EDITOR,
      payload: { id: "1234" }
    });
  });
});

describe("createCellBelow", () => {
  test("creates a CREATE_CELL_BELOW action with provided source string", () => {
    const cellType = "code";
    const id = "1234";
    const source = 'print("woo")';
    expect(actions.createCellBelow({ cellType, id, source })).toEqual({
      type: actionTypes.CREATE_CELL_BELOW,
      payload: { source, cellType, id }
    });
  });
});

describe("createCellAbove", () => {
  test("creates a CREATE_CELL_ABOVE action", () => {
    expect(
      actions.createCellAbove({ cellType: "markdown", id: "1234" })
    ).toEqual({
      type: actionTypes.CREATE_CELL_ABOVE,
      payload: {
        cellType: "markdown",
        id: "1234"
      }
    });
  });
});

describe("createCellAfter", () => {
  test("DEPRECATION WARNING:DEPRECATED. Use createCellBelow() instead. creates a CREATE_CELL_AFTER action with provided source string", () => {
    const cellType = "code";
    const id = "1234";
    const source = 'print("woo")';
    expect(actions.createCellAfter({ cellType, id, source })).toEqual({
      type: actionTypes.CREATE_CELL_AFTER,
      payload: { source, cellType, id }
    });
  });
});

describe("createCellBefore", () => {
  test("DEPRECATION WARNING:DEPRECATED. USE createCellAbove() instead. creates a CREATE_CELL_BEFORE action", () => {
    expect(
      actions.createCellBefore({ cellType: "markdown", id: "1234" })
    ).toEqual({
      type: actionTypes.CREATE_CELL_BEFORE,
      payload: {
        cellType: "markdown",
        id: "1234"
      }
    });
  });
});

describe("createCellAppend", () => {
  test("creates a CREATE_CELL_APPEND action", () => {
    expect(actions.createCellAppend({ cellType: "markdown" })).toEqual({
      type: actionTypes.CREATE_CELL_APPEND,
      payload: { cellType: "markdown" }
    });
  });
});

describe("setNotificationSystem", () => {
  test("creates a SET_NOTIFICATION_SYSTEM action", () => {
    expect(actions.setNotificationSystem(null)).toEqual({
      type: actionTypes.SET_NOTIFICATION_SYSTEM,
      notificationSystem: null
    });
  });
});

describe("overwriteMetadataField", () => {
  test("creates an OVERWRITE_METADATA_FIELD", () => {
    expect(
      actions.overwriteMetadataField({
        field: "foo",
        value: {
          bar: 3
        }
      })
    ).toEqual({
      type: actionTypes.OVERWRITE_METADATA_FIELD,
      payload: {
        field: "foo",
        value: { bar: 3 }
      }
    });
  });
});

describe("copyCell", () => {
  test("creates a COPY_CELL action", () => {
    expect(actions.copyCell({ id: "235" })).toEqual({
      type: actionTypes.COPY_CELL,
      payload: { id: "235" }
    });
  });
});

describe("cutCell", () => {
  test("creates a CUT_CELL action", () => {
    expect(actions.cutCell({ id: "235" })).toEqual({
      type: actionTypes.CUT_CELL,
      payload: { id: "235" }
    });
  });
});

describe("toggleCellOutputVisibility", () => {
  test("creates a TOGGLE_CELL_OUTPUT_VISIBILITY action", () => {
    expect(actions.toggleCellOutputVisibility({ id: "235" })).toEqual({
      type: actionTypes.TOGGLE_CELL_OUTPUT_VISIBILITY,
      payload: { id: "235" }
    });
  });
});

describe("toggleCellInputVisibility", () => {
  test("creates a TOGGLE_CELL_INPUT_VISIBILITY action", () => {
    expect(actions.toggleCellInputVisibility({ id: "235" })).toEqual({
      type: actionTypes.TOGGLE_CELL_INPUT_VISIBILITY,
      payload: { id: "235" }
    });
  });
});

describe("pasteCell", () => {
  test("creates a PASTE_CELL action", () => {
    expect(actions.pasteCell({})).toEqual({
      type: actionTypes.PASTE_CELL,
      payload: {}
    });
  });
});

describe("changeCellType", () => {
  test("creates a CHANGE_CELL_TYPE action", () => {
    expect(actions.changeCellType({ id: "235", to: "markdown" })).toEqual({
      type: actionTypes.CHANGE_CELL_TYPE,
      payload: {
        id: "235",
        to: "markdown"
      }
    });
  });
});

describe("setGithubToken", () => {
  test("creates a SET_GITHUB_TOKEN action", () => {
    expect(actions.setGithubToken("token_string")).toEqual({
      type: actionTypes.SET_GITHUB_TOKEN,
      githubToken: "token_string"
    });
  });
});

describe("toggleOutputExpansion", () => {
  test("creates a TOGGLE_OUTPUT_EXPANSION action", () => {
    expect(actions.toggleOutputExpansion({ id: "235" })).toEqual({
      type: actionTypes.TOGGLE_OUTPUT_EXPANSION,
      payload: { id: "235" }
    });
  });
});

describe("save", () => {
  test("creates a SAVE action", () => {
    expect(actions.save({})).toEqual({
      type: actionTypes.SAVE,
      payload: {}
    });
  });

  test("creates a SAVE_AS action", () => {
    expect(actions.saveAs({ filename: "foo.ipynb" })).toEqual({
      type: actionTypes.SAVE_AS,
      payload: { filename: "foo.ipynb" }
    });
  });

  test("creates a SAVE_FAILED action", () => {
    const error = new Error("fake");
    expect(actions.saveFailed({ error })).toEqual({
      type: actionTypes.SAVE_FAILED,
      error: true,
      payload: { error }
    });
  });

  test("creates a SAVE_FULFILLED action", () => {
    expect(actions.saveFulfilled({})).toEqual({
      type: actionTypes.SAVE_FULFILLED,
      payload: {}
    });
  });
});
