// @flow
import * as actions from "../actions";
import * as constants from "../constants";

describe("action creators", () => {
  test("create terrific actions", () => {
    expect(actions.setExecutionState("idle")).toEqual({
      type: constants.SET_EXECUTION_STATE,
      executionState: "idle"
    });

    expect(actions.newKernel({ spec: "hokey" }, ".")).toEqual({
      type: constants.LAUNCH_KERNEL,
      kernelSpec: { spec: "hokey" },
      cwd: "."
    });

    expect(actions.newKernelByName("python2", ".")).toEqual({
      type: constants.LAUNCH_KERNEL_BY_NAME,
      kernelSpecName: "python2",
      cwd: "."
    });

    const kernelInfo = { name: "japanese" };
    expect(actions.setNotebookKernelInfo(kernelInfo)).toEqual({
      type: constants.SET_KERNEL_INFO,
      kernelInfo: {
        name: "japanese"
      }
    });

    expect(actions.updateCellSource("1234", "# test")).toEqual({
      type: "SET_IN_CELL",
      id: "1234",
      path: ["source"],
      value: "# test"
    });

    expect(actions.clearOutputs("woo")).toEqual({
      type: "CLEAR_OUTPUTS",
      id: "woo"
    });

    expect(actions.updateCellExecutionCount("1234", 3)).toEqual({
      type: "SET_IN_CELL",
      id: "1234",
      path: ["execution_count"],
      value: 3
    });

    expect(
      actions.updateCellPagers("1234", {
        data: "woo"
      })
    ).toEqual({
      type: constants.UPDATE_CELL_PAGERS,
      id: "1234",
      pagers: { data: "woo" }
    });

    expect(actions.updateCellStatus("1234", "test")).toEqual({
      type: constants.UPDATE_CELL_STATUS,
      id: "1234",
      status: "test"
    });

    expect(actions.moveCell("1234", "5678", true)).toEqual({
      type: constants.MOVE_CELL,
      id: "1234",
      destinationId: "5678",
      above: true
    });

    expect(actions.removeCell("1234")).toEqual({
      type: constants.REMOVE_CELL,
      id: "1234"
    });

    expect(actions.focusCell("1234")).toEqual({
      type: constants.FOCUS_CELL,
      id: "1234"
    });

    expect(actions.focusNextCell("1234")).toEqual({
      type: constants.FOCUS_NEXT_CELL,
      id: "1234",
      createCellIfUndefined: undefined
    });
    expect(actions.focusNextCell("1234", true)).toEqual({
      type: constants.FOCUS_NEXT_CELL,
      id: "1234",
      createCellIfUndefined: true
    });

    expect(actions.focusPreviousCell("1234")).toEqual({
      type: constants.FOCUS_PREVIOUS_CELL,
      id: "1234"
    });

    expect(actions.focusCellEditor("1234")).toEqual({
      type: constants.FOCUS_CELL_EDITOR,
      id: "1234"
    });

    expect(actions.focusPreviousCellEditor("1234")).toEqual({
      type: constants.FOCUS_PREVIOUS_CELL_EDITOR,
      id: "1234"
    });

    expect(actions.focusNextCellEditor("1234")).toEqual({
      type: constants.FOCUS_NEXT_CELL_EDITOR,
      id: "1234"
    });

    expect(actions.createCellAfter("markdown", "1234")).toEqual({
      type: constants.NEW_CELL_AFTER,
      source: "",
      cellType: "markdown",
      id: "1234"
    });
    expect(actions.createCellAfter("code", "1234", 'print("woo")')).toEqual({
      type: constants.NEW_CELL_AFTER,
      source: 'print("woo")',
      cellType: "code",
      id: "1234"
    });

    expect(actions.createCellBefore("markdown", "1234")).toEqual({
      type: constants.NEW_CELL_BEFORE,
      cellType: "markdown",
      id: "1234"
    });

    expect(actions.toggleStickyCell("1234")).toEqual({
      type: constants.TOGGLE_STICKY_CELL,
      id: "1234"
    });

    expect(actions.createCellAppend("markdown")).toEqual({
      type: constants.NEW_CELL_APPEND,
      cellType: "markdown"
    });

    expect(actions.mergeCellAfter("0121")).toEqual({
      type: constants.MERGE_CELL_AFTER,
      id: "0121"
    });

    expect(actions.setNotificationSystem(null)).toEqual({
      type: constants.SET_NOTIFICATION_SYSTEM,
      notificationSystem: null
    });

    expect(
      actions.overwriteMetadata("foo", {
        bar: 3
      })
    ).toEqual({
      type: constants.OVERWRITE_METADATA_FIELD,
      field: "foo",
      value: { bar: 3 }
    });

    expect(actions.copyCell("235")).toEqual({
      type: constants.COPY_CELL,
      id: "235"
    });

    expect(actions.cutCell("235")).toEqual({
      type: constants.CUT_CELL,
      id: "235"
    });

    expect(actions.changeOutputVisibility("235")).toEqual({
      type: constants.CHANGE_OUTPUT_VISIBILITY,
      id: "235"
    });

    expect(actions.changeInputVisibility("235")).toEqual({
      type: constants.CHANGE_INPUT_VISIBILITY,
      id: "235"
    });

    expect(actions.pasteCell()).toEqual({ type: constants.PASTE_CELL });

    expect(actions.changeCellType("235", "markdown")).toEqual({
      type: constants.CHANGE_CELL_TYPE,
      id: "235",
      to: "markdown"
    });

    expect(actions.setGithubToken("token_string")).toEqual({
      type: constants.SET_GITHUB_TOKEN,
      githubToken: "token_string"
    });

    expect(actions.toggleOutputExpansion("235")).toEqual({
      type: constants.TOGGLE_OUTPUT_EXPANSION,
      id: "235"
    });

    const fakeNotebook = { nbformat: "eh" };
    expect(actions.save("foo.ipynb", fakeNotebook)).toEqual({
      type: constants.SAVE,
      filename: "foo.ipynb",
      notebook: fakeNotebook
    });

    expect(actions.saveAs("foo.ipynb", fakeNotebook)).toEqual({
      type: constants.SAVE_AS,
      filename: "foo.ipynb",
      notebook: fakeNotebook
    });

    expect(actions.doneSaving(fakeNotebook)).toEqual({
      type: constants.DONE_SAVING,
      notebook: fakeNotebook
    });
  });
});
