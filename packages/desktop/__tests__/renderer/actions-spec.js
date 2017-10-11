// @flow
import * as actions from "../../src/notebook/actions";
import * as constants from "../../src/notebook/constants";

import { dummyCommutable } from "dummy-nb";

describe("setExecutionState", () => {
  test("creates a SET_EXECUTION_STATE action", () => {
    expect(actions.setExecutionState("idle")).toEqual({
      type: constants.SET_EXECUTION_STATE,
      executionState: "idle"
    });
  });
});

describe("newKernel", () => {
  test("creates a LAUNCH_KERNEL action", () => {
    expect(actions.newKernel({ spec: "hokey" }, ".")).toEqual({
      type: constants.LAUNCH_KERNEL,
      kernelSpec: { spec: "hokey" },
      cwd: "."
    });
  });
});

describe("newKernelByName", () => {
  test("creates a LAUNCH_KERNEL_BY_NAME action", () => {
    expect(actions.newKernelByName("python2", ".")).toEqual({
      type: constants.LAUNCH_KERNEL_BY_NAME,
      kernelSpecName: "python2",
      cwd: "."
    });
  });
});

describe("setNotebookKernelInfo", () => {
  test("creates a SET_KERNEL_INFO action", () => {
    const kernelInfo = { name: "japanese" };
    expect(actions.setNotebookKernelInfo(kernelInfo)).toEqual({
      type: constants.SET_KERNEL_INFO,
      kernelInfo: {
        name: "japanese"
      }
    });
  });
});

describe("updateCellSource", () => {
  test("creates a UPDATE_CELL_SOURCE action", () => {
    expect(actions.updateCellSource("1234", "# test")).toEqual({
      type: "SET_IN_CELL",
      id: "1234",
      path: ["source"],
      value: "# test"
    });
  });
});

describe("clearOutputs", () => {
  test("creates a CLEAR_OUTPUTS action", () => {
    expect(actions.clearOutputs("woo")).toEqual({
      type: "CLEAR_OUTPUTS",
      id: "woo"
    });
  });
});

describe("updateCellExecutionCount", () => {
  test("creates a UPDATE_CELL_EXECUTION_COUNT action", () => {
    expect(actions.updateCellExecutionCount("1234", 3)).toEqual({
      type: "SET_IN_CELL",
      id: "1234",
      path: ["execution_count"],
      value: 3
    });
  });
});

describe("updateCellPagers", () => {
  test("creates a UPDATE_CELL_PAGERS action", () => {
    expect(
      actions.updateCellPagers("1234", {
        data: "woo"
      })
    ).toEqual({
      type: constants.UPDATE_CELL_PAGERS,
      id: "1234",
      pagers: { data: "woo" }
    });
  });
});

describe("updateCellStatus", () => {
  test("creates an UPDATE_CELL_STATUS action", () => {
    expect(actions.updateCellStatus("1234", "test")).toEqual({
      type: constants.UPDATE_CELL_STATUS,
      id: "1234",
      status: "test"
    });
  });
});

describe("moveCell", () => {
  test("creates a MOVE_CELL action", () => {
    expect(actions.moveCell("1234", "5678", true)).toEqual({
      type: constants.MOVE_CELL,
      id: "1234",
      destinationId: "5678",
      above: true
    });
  });
});

describe("removeCell", () => {
  test("creates a REMOVE_CELL action", () => {
    expect(actions.removeCell("1234")).toEqual({
      type: constants.REMOVE_CELL,
      id: "1234"
    });
  });
});

describe("focusCell", () => {
  test("creates a FOCUS_CELL action", () => {
    expect(actions.focusCell("1234")).toEqual({
      type: constants.FOCUS_CELL,
      id: "1234"
    });
  });
});

describe("focusNextCell", () => {
  test("creates a FOCUS_NEXT_CELL action", () => {
    expect(actions.focusNextCell("1234")).toEqual({
      type: constants.FOCUS_NEXT_CELL,
      id: "1234",
      createCellIfUndefined: undefined
    });
  });
  test("creates a FOCUS_NEXT_CELL action with cell creation flag", () => {
    expect(actions.focusNextCell("1234", true)).toEqual({
      type: constants.FOCUS_NEXT_CELL,
      id: "1234",
      createCellIfUndefined: true
    });
  });
});

describe("focusPreviousCell", () => {
  test("creates a FOCUS_PREVIOUS_CELL action", () => {
    expect(actions.focusPreviousCell("1234")).toEqual({
      type: constants.FOCUS_PREVIOUS_CELL,
      id: "1234"
    });
  });
});

describe("focusCellEditor", () => {
  test("creates a FOCUS_CELL_EDITOR action", () => {
    expect(actions.focusCellEditor("1234")).toEqual({
      type: constants.FOCUS_CELL_EDITOR,
      id: "1234"
    });
  });
});

describe("focusPreviousCellEditor", () => {
  test("creates a FOCUS_PREVIOUS_CELL_EDITOR action", () => {
    expect(actions.focusPreviousCellEditor("1234")).toEqual({
      type: constants.FOCUS_PREVIOUS_CELL_EDITOR,
      id: "1234"
    });
  });
});

describe("focusNextCellEditor", () => {
  test("creates a FOCUS_NEXT_CELL_EDITOR action", () => {
    expect(actions.focusNextCellEditor("1234")).toEqual({
      type: constants.FOCUS_NEXT_CELL_EDITOR,
      id: "1234"
    });
  });
});

describe("createCellAfter", () => {
  test("creates a NEW_CELL_AFTER action with default empty source string", () => {
    expect(actions.createCellAfter("markdown", "1234")).toEqual({
      type: constants.NEW_CELL_AFTER,
      source: "",
      cellType: "markdown",
      id: "1234"
    });
  });
  test("creates a NEW_CELL_AFTER action with provided source string", () => {
    expect(actions.createCellAfter("code", "1234", 'print("woo")')).toEqual({
      type: constants.NEW_CELL_AFTER,
      source: 'print("woo")',
      cellType: "code",
      id: "1234"
    });
  });
});

describe("createCellBefore", () => {
  test("creates a NEW_CELL_BEFORE action", () => {
    expect(actions.createCellBefore("markdown", "1234")).toEqual({
      type: constants.NEW_CELL_BEFORE,
      cellType: "markdown",
      id: "1234"
    });
  });
});

describe("toggleStickyCell", () => {
  test("creates a TOGGLE_STICKY_CELL action", () => {
    expect(actions.toggleStickyCell("1234")).toEqual({
      type: constants.TOGGLE_STICKY_CELL,
      id: "1234"
    });
  });
});

describe("createCellAppend", () => {
  test("creates a NEW_CELL_APPEND action", () => {
    expect(actions.createCellAppend("markdown")).toEqual({
      type: constants.NEW_CELL_APPEND,
      cellType: "markdown"
    });
  });
});

describe("mergeCellAfter", () => {
  test("creates a MERGE_CELL_AFTER action", () => {
    expect(actions.mergeCellAfter("0121")).toEqual({
      type: constants.MERGE_CELL_AFTER,
      id: "0121"
    });
  });
});

describe("setNotificationSystem", () => {
  test("creates a SET_NOTIFICATION_SYSTEM action", () => {
    expect(actions.setNotificationSystem(null)).toEqual({
      type: constants.SET_NOTIFICATION_SYSTEM,
      notificationSystem: null
    });
  });
});

describe("overwriteMetadata", () => {
  test("creates an OVERWRITE_METADATA_FIELD", () => {
    expect(
      actions.overwriteMetadata("foo", {
        bar: 3
      })
    ).toEqual({
      type: constants.OVERWRITE_METADATA_FIELD,
      field: "foo",
      value: { bar: 3 }
    });
  });
});

describe("copyCell", () => {
  test("creates a COPY_CELL action", () => {
    expect(actions.copyCell("235")).toEqual({
      type: constants.COPY_CELL,
      id: "235"
    });
  });
});

describe("cutCell", () => {
  test("creates a CUT_CELL action", () => {
    expect(actions.cutCell("235")).toEqual({
      type: constants.CUT_CELL,
      id: "235"
    });
  });
});

describe("changeOutputVisibility", () => {
  test("creates a CHANGE_OUTPUT_VISIBILITY action", () => {
    expect(actions.changeOutputVisibility("235")).toEqual({
      type: constants.CHANGE_OUTPUT_VISIBILITY,
      id: "235"
    });
  });
});

describe("changeInputVisibility", () => {
  test("creates a CHANGE_INPUT_VISIBILITY action", () => {
    expect(actions.changeInputVisibility("235")).toEqual({
      type: constants.CHANGE_INPUT_VISIBILITY,
      id: "235"
    });
  });
});

describe("pasteCell", () => {
  test("creates a PASTE_CELL action", () => {
    expect(actions.pasteCell()).toEqual({ type: constants.PASTE_CELL });
  });
});

describe("changeCellType", () => {
  test("creates a CHANGE_CELL_TYPE action", () => {
    expect(actions.changeCellType("235", "markdown")).toEqual({
      type: constants.CHANGE_CELL_TYPE,
      id: "235",
      to: "markdown"
    });
  });
});

describe("setGithubToken", () => {
  test("creates a SET_GITHUB_TOKEN action", () => {
    expect(actions.setGithubToken("token_string")).toEqual({
      type: constants.SET_GITHUB_TOKEN,
      githubToken: "token_string"
    });
  });
});

describe("toggleOutputExpansion", () => {
  test("creates a TOGGLE_OUTPUT_EXPANSION action", () => {
    expect(actions.toggleOutputExpansion("235")).toEqual({
      type: constants.TOGGLE_OUTPUT_EXPANSION,
      id: "235"
    });
  });
});

describe("save", () => {
  test("creates a SAVE action", () => {
    expect(actions.save("foo.ipynb", dummyCommutable)).toEqual({
      type: constants.SAVE,
      filename: "foo.ipynb",
      notebook: dummyCommutable
    });
  });

  test("creates a SAVE_AS action", () => {
    expect(actions.saveAs("foo.ipynb", dummyCommutable)).toEqual({
      type: constants.SAVE_AS,
      filename: "foo.ipynb",
      notebook: dummyCommutable
    });
  });

  test("creates a SAVE_AS action", () => {
    expect(actions.doneSaving(dummyCommutable)).toEqual({
      type: constants.DONE_SAVING,
      notebook: dummyCommutable
    });
  });
});
