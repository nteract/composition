import { webFrame, ipcRenderer as ipc } from "electron";
jest.mock("fs");
import { dummyStore } from "utils";
import * as menu from "../../src/notebook/menu";
import * as constants from "@nteract/core/constants";

describe("menu", () => {
  describe("dispatchCreateCellAfter", () => {
    test("dispatches a CREATE_CELL_AFTER action", () => {
      const store = dummyStore();
      store.dispatch = jest.fn();

      menu.dispatchCreateCellAfter(store);

      expect(store.dispatch).toHaveBeenCalledWith({
        type: constants.NEW_CELL_AFTER,
        cellType: "code",
        source: "",
        id: null
      });
    });
  });

  describe("dispatchCreateTextCellAfter", () => {
    test("dispatches a CREATE_TEXT_CELL_AFTER action", () => {
      const store = dummyStore();
      store.dispatch = jest.fn();

      menu.dispatchCreateTextCellAfter(store);

      expect(store.dispatch).toHaveBeenCalledWith({
        type: constants.NEW_CELL_AFTER,
        cellType: "markdown",
        source: "",
        id: null
      });
    });
  });

  describe("dispatchPasteCell", () => {
    test("dispatches a PASTE_CELL action", () => {
      const store = dummyStore();
      store.dispatch = jest.fn();

      menu.dispatchPasteCell(store);

      expect(store.dispatch).toHaveBeenCalledWith({
        type: constants.PASTE_CELL
      });
    });
  });

  describe("dispatchCutCell", () => {
    test("dispatches a CUT_CELL action", () => {
      const store = dummyStore();
      store.dispatch = jest.fn();

      menu.dispatchCutCell(store);

      expect(store.dispatch).toHaveBeenCalledWith({
        type: constants.CUT_CELL,
        id: null
      });
    });
  });

  describe("dispatchCopyCell", () => {
    test("dispatches a COPY_CELL action", () => {
      const store = dummyStore();
      store.dispatch = jest.fn();

      menu.dispatchCopyCell(store);

      expect(store.dispatch).toHaveBeenCalledWith({
        type: constants.COPY_CELL,
        id: null
      });
    });
  });

  describe("dispatchSetTheme", () => {
    test("dispatches a SET_CONFIG_KEY action", () => {
      const store = dummyStore();
      store.dispatch = jest.fn();

      menu.dispatchSetTheme(store, {}, "test_theme");

      expect(store.dispatch).toHaveBeenCalledWith({
        type: constants.SET_CONFIG_KEY,
        key: "theme",
        value: "test_theme"
      });
    });
  });
  describe("dispatchSetCursorBlink", () => {
    test("dispatches a SET_CONFIG_KEY action", () => {
      const store = dummyStore();
      store.dispatch = jest.fn();

      menu.dispatchSetCursorBlink(store, {}, 42);

      expect(store.dispatch).toHaveBeenCalledWith({
        type: constants.SET_CONFIG_KEY,
        key: "cursorBlinkRate",
        value: 42
      });
    });
  });

  describe("dispatchLoadConfig", () => {
    test("dispatches a LOAD_CONFIG action", () => {
      const store = dummyStore();
      store.dispatch = jest.fn();

      menu.dispatchLoadConfig(store);

      expect(store.dispatch).toHaveBeenCalledWith({
        type: "LOAD_CONFIG"
      });
    });
  });

  describe("dispatchZoomOut", () => {
    test("executes zoom out", () => {
      webFrame.setZoomLevel.mockReset();
      menu.dispatchZoomOut();
      expect(webFrame.setZoomLevel).toHaveBeenCalled();
    });
  });

  describe("dispatchZoomIn", () => {
    test("executes zoom in", () => {
      webFrame.setZoomLevel.mockReset();
      menu.dispatchZoomIn();
      expect(webFrame.setZoomLevel).toHaveBeenCalled();
    });
  });

  describe("dispatchZoomReset", () => {
    test("executes zoom reset", () => {
      webFrame.setZoomLevel.mockReset();
      menu.dispatchZoomReset();
      expect(webFrame.setZoomLevel).toHaveBeenCalledWith(0);
    });
  });

  describe("dispatchRestartClearAll", () => {
    test("dispatches KILL_KERNEL and CLEAR_OUTPUTS actions", () => {
      const store = dummyStore();
      store.dispatch = jest.fn();

      menu.dispatchRestartClearAll(store);

      expect(store.dispatch).toHaveBeenCalledWith({
        type: constants.KILL_KERNEL
      });
    });
  });

  describe("dispatchRestartKernel", () => {
    test("dispatches KILL_KERNEL and NEW_KERNEL actions", () => {
      const store = dummyStore();
      store.dispatch = jest.fn();

      menu.dispatchRestartKernel(store);

      expect(store.dispatch).toHaveBeenCalledWith({
        type: constants.KILL_KERNEL
      });
    });
  });

  describe("dispatchInterruptKernel", () => {
    test("dispatches INTERRUPT_KERNEL actions", () => {
      const store = dummyStore();
      store.dispatch = jest.fn();

      menu.dispatchInterruptKernel(store);

      if (process.platform !== "win32") {
        expect(store.dispatch).toHaveBeenCalledWith({
          type: constants.INTERRUPT_KERNEL
        });
      }
    });
  });

  describe("dispatchKillKernel", () => {
    test("dispatches KILL_KERNEL actions", () => {
      const store = dummyStore();
      store.dispatch = jest.fn();

      menu.dispatchKillKernel(store);

      expect(store.dispatch).toHaveBeenCalledWith({
        type: constants.KILL_KERNEL
      });
    });
  });

  describe("dispatchClearAll", () => {
    test("dispatches CLEAR_OUTPUTS actions", () => {
      const store = dummyStore();
      store.dispatch = jest.fn();

      menu.dispatchClearAll(store);

      expect(store.dispatch).toHaveBeenCalledWith({
        type: constants.CLEAR_OUTPUTS,
        id: store
          .getState()
          .document.getIn(["notebook", "cellOrder"])
          .first()
      });
    });
  });

  describe("dispatchRunAllBelow", () => {
    test("runs all code cells below the focused cell", () => {
      const store = dummyStore({ codeCellCount: 4, markdownCellCount: 4 });
      const markdownCells = store
        .getState()
        .document.getIn(["notebook", "cellMap"])
        .filter(cell => cell.get("cell_type") === "markdown");
      store.dispatch = jest.fn();

      menu.dispatchRunAllBelow(store);

      expect(store.dispatch).toHaveBeenCalledTimes(3);
      markdownCells.forEach(cellId => {
        expect(store.dispatch).not.toHaveBeenCalledWith({
          type: "EXECUTE_CELL",
          id: cellId,
          source: ""
        });
      });
    });
  });

  describe("dispatchRunAll", () => {
    test("dispatches EXECUTE_CELL for all cells action", () => {
      const store = dummyStore();
      store.dispatch = jest.fn();

      menu.dispatchRunAll(store);

      const first = store
        .getState()
        .document.getIn(["notebook", "cellOrder"])
        .first();
      expect(store.dispatch).toHaveBeenCalledWith({
        type: "EXECUTE_CELL",
        id: first,
        source: store
          .getState()
          .document.getIn(["notebook", "cellMap", first, "source"])
      });
    });
  });

  describe("dispatchUnhideAll", () => {
    test("dispatches changeInputVisibility for hidden code cells", () => {
      const store = dummyStore({ hideAll: true });
      store.dispatch = jest.fn();

      menu.dispatchUnhideAll(store);

      const first = store
        .getState()
        .document.getIn(["notebook", "cellOrder"])
        .first();
      const expectedAction = { type: "CHANGE_INPUT_VISIBILITY", id: first };
      expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });
  });

  describe("dispatchPublishAnonGist", () => {
    test("dispatches PUBLISH_ANONYMOUS_GIST action", () => {
      const store = dummyStore();
      store.dispatch = jest.fn();
      menu.dispatchPublishAnonGist(store);
      expect(store.dispatch).toHaveBeenCalledWith({
        type: "PUBLISH_ANONYMOUS_GIST"
      });
    });
  });

  describe("dispatchPublishUserGist", () => {
    test("sets github token if token provided", () => {
      const store = dummyStore();
      store.dispatch = jest.fn();
      menu.dispatchPublishUserGist(store, {}, "TOKEN");
      const expectedAction = { type: "SET_GITHUB_TOKEN", githubToken: "TOKEN" };
      expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });
    test("dispatches setUserGithub and publishes gist", () => {
      const store = dummyStore();
      store.dispatch = jest.fn();
      menu.dispatchPublishUserGist(store, {});
      const expectedSecondAction = { type: "PUBLISH_USER_GIST" };
      expect(store.dispatch).toHaveBeenCalledWith(expectedSecondAction);
    });
  });

  describe("dispatchNewKernel", () => {
    test("dispatches LAUNCH_KERNEL action", () => {
      const store = dummyStore();
      store.dispatch = jest.fn();

      menu.dispatchNewKernel(store, {}, { spec: "hokey" });

      expect(store.dispatch).toHaveBeenCalledWith({
        type: constants.LAUNCH_KERNEL,
        kernelSpec: { spec: "hokey" },
        cwd: process.cwd()
      });
    });
  });

  describe("dispatchSave", () => {
    test("sends as SAVE request if given a filename", () => {
      const store = dummyStore();
      store.dispatch = jest.fn();

      menu.dispatchSave(store);

      expect(store.dispatch).toHaveBeenCalledWith({
        type: "SAVE",
        filename: store.getState().metadata.get("filename"),
        notebook: store.getState().document.get("notebook")
      });
    });
  });

  describe("dispatchSaveAs", () => {
    test("dispatches SAVE_AS action", () => {
      const store = dummyStore();
      store.dispatch = jest.fn();

      menu.dispatchSaveAs(store, {}, "test-ipynb.ipynb");
      expect(store.dispatch).toHaveBeenCalledWith({
        type: "SAVE_AS",
        filename: "test-ipynb.ipynb",
        notebook: store.getState().document.get("notebook")
      });
    });
  });

  describe("dispatchLoad", () => {
    test("dispatches LOAD action", () => {
      const store = dummyStore();
      store.dispatch = jest.fn();

      menu.dispatchLoad(store, {}, "test-ipynb.ipynb");
      expect(store.dispatch).toHaveBeenCalledWith({
        type: "LOAD",
        filename: "test-ipynb.ipynb"
      });
    });
  });

  describe("dispatchNewNotebook", () => {
    test("dispatches a NEW_NOTEBOOK action", () => {
      const store = dummyStore();
      store.dispatch = jest.fn();

      menu.dispatchNewNotebook(store, {}, { spec: "hokey" });
      expect(store.dispatch).toHaveBeenCalledWith({
        type: "NEW_NOTEBOOK",
        kernelSpec: { spec: "hokey" },
        cwd: process.cwd()
      });
    });
  });

  describe("initMenuHandlers", () => {
    test("registers the menu events", () => {
      const store = dummyStore();
      ipc.on = jest.fn();
      menu.initMenuHandlers(store);
      [
        "main:load-config",
        "menu:exportPDF",
        "menu:new-kernel",
        "menu:run-all",
        "menu:clear-all",
        "menu:unhide-all",
        "menu:save",
        "menu:save-as",
        "menu:new-code-cell",
        "menu:copy-cell",
        "menu:cut-cell",
        "menu:paste-cell",
        "menu:kill-kernel",
        "menu:interrupt-kernel",
        "menu:restart-kernel",
        "menu:restart-and-clear-all",
        "menu:publish:gist",
        "menu:github:auth",
        "menu:zoom-in",
        "menu:zoom-out",
        "menu:theme",
        "menu:set-blink-rate",
        "main:load",
        "main:new"
      ].forEach(name => {
        expect(ipc.on).toHaveBeenCalledWith(name, expect.any(Function));
      });
    });
  });

  describe("showSaveAsDialog", () => {
    test("returns a promise", () => {
      const dialog = menu.showSaveAsDialog();
      expect(dialog).toEqual(expect.any(Promise));
    });
  });

  describe("triggerWindowRefresh", () => {
    test("does nothing if no filename is given", () => {
      const store = dummyStore();

      expect(menu.triggerWindowRefresh(store, null)).toBeUndefined();
    });
    test("sends a SAVE_AS action if given filename", () => {
      const store = dummyStore();
      const filename = "dummy-nb.ipynb";
      store.dispatch = jest.fn();

      menu.triggerWindowRefresh(store, filename);

      expect(store.dispatch).toHaveBeenCalledWith({
        type: "SAVE_AS",
        notebook: store.getState().document.get("notebook"),
        filename
      });
    });
  });

  describe("exportPDF", () => {
    test.skip("it notifies a user upon successful write", () => {
      const store = dummyStore();
      const notificationSystem = { addNotification: jest.fn() };
      const filename = "thisisafilename.ipynb";
      menu.exportPDF(store, filename, notificationSystem);
      expect(notificationSystem.addNotification).toHaveBeenCalledWith({
        title: "PDF exported",
        message: `Notebook ${filename} has been exported as a pdf.`,
        dismissible: true,
        position: "tr",
        level: "success"
      });
    });
  });
  describe("triggerSaveAsPDF", () => {
    test("does something", () => {});
  });

  describe("storeToPDF", () => {
    test("triggers notification when not saved", () => {
      const config = { noFilename: true };
      const store = dummyStore(config);
      const addNotification = store.getState().app.get("notificationSystem")
        .addNotification;
      menu.storeToPDF(store);
      expect(addNotification).toHaveBeenCalledWith({
        action: { callback: expect.any(Function), label: "Save As" },
        title: "File has not been saved!",
        message: [
          "Click the button below to save the notebook such that it can be ",
          "exported as a PDF."
        ],
        dismissible: true,
        position: "tr",
        level: "warning"
      });
    });
    test.skip("calls export PDF when filename exists", () => {
      const store = dummyStore();
      const addNotification = store.getState().app.get("notificationSystem")
        .addNotification;
      menu.storeToPDF(store);
      expect(addNotification).toHaveBeenCalledWith({
        title: "PDF exported",
        message: "Notebook dummy-store-nb has been exported as a pdf.",
        dismissible: true,
        position: "tr",
        level: "success"
      });
    });
  });
});
