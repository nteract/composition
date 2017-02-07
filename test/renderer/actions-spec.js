import { expect } from "chai";

import * as actions from "../../src/notebook/actions";
import * as constants from "../../src/notebook/constants";

import { dummyCommutable } from "./dummy-nb";

describe("setExecutionState", () => {
  it("creates a SET_EXECUTION_STATE action", () => {
    expect(actions.setExecutionState("idle")).to.deep.equal({
      type: constants.SET_EXECUTION_STATE,
      executionState: "idle"
    });
  });
});

describe("newKernel", () => {
  it("creates a LAUNCH_KERNEL action", () => {
    expect(actions.newKernel({ spec: "hokey" }, ".")).to.deep.equal({
      type: constants.LAUNCH_KERNEL,
      kernelSpec: { spec: "hokey" },
      cwd: "."
    });
  });
});

describe("newKernelByName", () => {
  it("creates a LAUNCH_KERNEL_BY_NAME action", () => {
    expect(actions.newKernelByName("python2", ".")).to.deep.equal({
      type: constants.LAUNCH_KERNEL_BY_NAME,
      kernelSpecName: "python2",
      cwd: "."
    });
  });
});

describe("setNotebookKernelInfo", () => {
  it("creates a SET_KERNEL_INFO action", () => {
    const kernelInfo = { name: "japanese" };
    expect(actions.setNotebookKernelInfo(kernelInfo)).to.deep.equal({
      type: constants.SET_KERNEL_INFO,
      kernelInfo: {
        name: "japanese"
      }
    });
  });
});

describe("updateCellSource", () => {
  it("creates a UPDATE_CELL_SOURCE action", () => {
    expect(actions.updateCellSource("1234", "# test")).to.deep.equal({
      type: constants.UPDATE_CELL_SOURCE,
      id: "1234",
      source: "# test"
    });
  });
});

describe("clearOutputs", () => {
  it("creates a CLEAR_OUTPUTS action", () => {
    expect(actions.clearOutputs("woo")).to.deep.equal({
      type: "CLEAR_OUTPUTS",
      id: "woo"
    });
  });
});

describe("updateCellExecutionCount", () => {
  it("creates a UPDATE_CELL_EXECUTION_COUNT action", () => {
    expect(actions.updateCellExecutionCount("1234", 3)).to.deep.equal({
      type: constants.UPDATE_CELL_EXECUTION_COUNT,
      id: "1234",
      count: 3
    });
  });
});

describe("updateCellPagers", () => {
  it("creates a UPDATE_CELL_PAGERS action", () => {
    expect(actions.updateCellPagers("1234", { data: "woo" })).to.deep.equal({
      type: constants.UPDATE_CELL_PAGERS,
      id: "1234",
      pagers: { data: "woo" }
    });
  });
});

describe("updateCellStatus", () => {
  it("creates an UPDATE_CELL_STATUS action", () => {
    expect(actions.updateCellStatus("1234", "test")).to.deep.equal({
      type: constants.UPDATE_CELL_STATUS,
      id: "1234",
      status: "test"
    });
  });
});

describe("moveCell", () => {
  it("creates a MOVE_CELL action", () => {
    expect(actions.moveCell("1234", "5678", true)).to.deep.equal({
      type: constants.MOVE_CELL,
      id: "1234",
      destinationId: "5678",
      above: true
    });
  });
});

describe("removeCell", () => {
  it("creates a REMOVE_CELL action", () => {
    expect(actions.removeCell("1234")).to.deep.equal({
      type: constants.REMOVE_CELL,
      id: "1234"
    });
  });
});

describe("focusCell", () => {
  it("creates a FOCUS_CELL action", () => {
    expect(actions.focusCell("1234")).to.deep.equal({
      type: constants.FOCUS_CELL,
      id: "1234"
    });
  });
});

describe("focusNextCell", () => {
  it("creates a FOCUS_NEXT_CELL action", () => {
    expect(actions.focusNextCell("1234")).to.deep.equal({
      type: constants.FOCUS_NEXT_CELL,
      id: "1234",
      createCellIfUndefined: undefined
    });
  });
  it("creates a FOCUS_NEXT_CELL action with cell creation flag", () => {
    expect(actions.focusNextCell("1234", true)).to.deep.equal({
      type: constants.FOCUS_NEXT_CELL,
      id: "1234",
      createCellIfUndefined: true
    });
  });
});

describe("focusPreviousCell", () => {
  it("creates a FOCUS_PREVIOUS_CELL action", () => {
    expect(actions.focusPreviousCell("1234")).to.deep.equal({
      type: constants.FOCUS_PREVIOUS_CELL,
      id: "1234"
    });
  });
});

describe("focusCellEditor", () => {
  it("creates a FOCUS_CELL_EDITOR action", () => {
    expect(actions.focusCellEditor("1234")).to.deep.equal({
      type: constants.FOCUS_CELL_EDITOR,
      id: "1234"
    });
  });
});

describe("focusPreviousCellEditor", () => {
  it("creates a FOCUS_PREVIOUS_CELL_EDITOR action", () => {
    expect(actions.focusPreviousCellEditor("1234")).to.deep.equal({
      type: constants.FOCUS_PREVIOUS_CELL_EDITOR,
      id: "1234"
    });
  });
});

describe("focusNextCellEditor", () => {
  it("creates a FOCUS_NEXT_CELL_EDITOR action", () => {
    expect(actions.focusNextCellEditor("1234")).to.deep.equal({
      type: constants.FOCUS_NEXT_CELL_EDITOR,
      id: "1234"
    });
  });
});

describe("createCellAfter", () => {
  it("creates a NEW_CELL_AFTER action with default empty source string", () => {
    expect(actions.createCellAfter("markdown", "1234")).to.deep.equal({
      type: constants.NEW_CELL_AFTER,
      source: "",
      cellType: "markdown",
      id: "1234"
    });
  });
  it("creates a NEW_CELL_AFTER action with provided source string", () => {
    expect(
      actions.createCellAfter("code", "1234", 'print("woo")')
    ).to.deep.equal({
      type: constants.NEW_CELL_AFTER,
      source: 'print("woo")',
      cellType: "code",
      id: "1234"
    });
  });
});

describe("createCellBefore", () => {
  it("creates a NEW_CELL_BEFORE action", () => {
    expect(actions.createCellBefore("markdown", "1234")).to.deep.equal({
      type: constants.NEW_CELL_BEFORE,
      cellType: "markdown",
      id: "1234"
    });
  });
});

describe("toggleStickyCell", () => {
  it("creates a TOGGLE_STICKY_CELL action", () => {
    expect(actions.toggleStickyCell("1234")).to.deep.equal({
      type: constants.TOGGLE_STICKY_CELL,
      id: "1234"
    });
  });
});

describe("createCellAppend", () => {
  it("creates a NEW_CELL_APPEND action", () => {
    expect(actions.createCellAppend("markdown")).to.deep.equal({
      type: constants.NEW_CELL_APPEND,
      cellType: "markdown"
    });
  });
});

describe("mergeCellAfter", () => {
  it("creates a MERGE_CELL_AFTER action", () => {
    expect(actions.mergeCellAfter("0121")).to.deep.equal({
      type: constants.MERGE_CELL_AFTER,
      id: "0121"
    });
  });
});

describe("setNotificationSystem", () => {
  it("creates a SET_NOTIFICATION_SYSTEM action", () => {
    expect(actions.setNotificationSystem(null)).to.deep.equal({
      type: constants.SET_NOTIFICATION_SYSTEM,
      notificationSystem: null
    });
  });
});

describe("overwriteMetadata", () => {
  it("creates an OVERWRITE_METADATA_FIELD", () => {
    expect(actions.overwriteMetadata("foo", { bar: 3 })).to.deep.equal({
      type: constants.OVERWRITE_METADATA_FIELD,
      field: "foo",
      value: { bar: 3 }
    });
  });
});

describe("setForwardCheckpoint", () => {
  it("creates a SET_FORWARD_CHECKPOINT", () => {
    expect(actions.setForwardCheckpoint(dummyCommutable)).to.deep.equal({
      type: constants.SET_FORWARD_CHECKPOINT,
      documentState: dummyCommutable
    });
  });
});

describe("setBackwardCheckpoint", () => {
  it("creates a SET_BACKWARD_CHECKPOINT", () => {
    expect(actions.setBackwardCheckpoint(dummyCommutable, true)).to.deep.equal({
      type: constants.SET_BACKWARD_CHECKPOINT,
      documentState: dummyCommutable,
      clearFutureStack: true
    });
  });
});

describe("copyCell", () => {
  it("creates a COPY_CELL action", () => {
    expect(actions.copyCell("235")).to.deep.equal({
      type: constants.COPY_CELL,
      id: "235"
    });
  });
});

describe("cutCell", () => {
  it("creates a CUT_CELL action", () => {
    expect(actions.cutCell("235")).to.deep.equal({
      type: constants.CUT_CELL,
      id: "235"
    });
  });
});

describe("changeOutputVisibility", () => {
  it("creates a CHANGE_OUTPUT_VISIBILITY action", () => {
    expect(actions.changeOutputVisibility("235")).to.deep.equal({
      type: constants.CHANGE_OUTPUT_VISIBILITY,
      id: "235"
    });
  });
});

describe("changeInputVisibility", () => {
  it("creates a CHANGE_INPUT_VISIBILITY action", () => {
    expect(actions.changeInputVisibility("235")).to.deep.equal({
      type: constants.CHANGE_INPUT_VISIBILITY,
      id: "235"
    });
  });
});

describe("pasteCell", () => {
  it("creates a PASTE_CELL action", () => {
    expect(actions.pasteCell()).to.deep.equal({
      type: constants.PASTE_CELL
    });
  });
});

describe("changeCellType", () => {
  it("creates a CHANGE_CELL_TYPE action", () => {
    expect(actions.changeCellType("235", "markdown")).to.deep.equal({
      type: constants.CHANGE_CELL_TYPE,
      id: "235",
      to: "markdown"
    });
  });
});

describe("setGithubToken", () => {
  it("creates a SET_GITHUB_TOKEN action", () => {
    expect(actions.setGithubToken("token_string")).to.deep.equal({
      type: constants.SET_GITHUB_TOKEN,
      githubToken: "token_string"
    });
  });
});

describe("toggleOutputExpansion", () => {
  it("creates a TOGGLE_OUTPUT_EXPANSION action", () => {
    expect(actions.toggleOutputExpansion("235")).to.deep.equal({
      type: constants.TOGGLE_OUTPUT_EXPANSION,
      id: "235"
    });
  });
});
