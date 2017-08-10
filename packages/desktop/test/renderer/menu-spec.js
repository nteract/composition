import { webFrame, ipcRenderer as ipc } from "electron";

import NotificationSystem from "react-notification-system";

import chai, { expect } from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";

import { dummyStore } from "../utils";
import * as menu from "../../src/notebook/menu";
import * as constants from "../../src/notebook/constants";

chai.use(sinonChai);

describe("menu", () => {
  describe("dispatchCreateCellAfter", () => {
    it("dispatches a CREATE_CELL_AFTER action", () => {
      const store = dummyStore();
      store.dispatch = sinon.spy();

      menu.dispatchCreateCellAfter(store);

      expect(store.dispatch.firstCall).to.be.calledWith({
        type: constants.NEW_CELL_AFTER,
        cellType: "code",
        source: "",
        id: null
      });
    });
  });

  describe("dispatchCreateTextCellAfter", () => {
    it("dispatches a CREATE_TEXT_CELL_AFTER action", () => {
      const store = dummyStore();
      store.dispatch = sinon.spy();

      menu.dispatchCreateTextCellAfter(store);

      expect(store.dispatch.firstCall).to.be.calledWith({
        type: constants.NEW_CELL_AFTER,
        cellType: "markdown",
        source: "",
        id: null
      });
    });
  });

  describe("dispatchPasteCell", () => {
    it("dispatches a PASTE_CELL action", () => {
      const store = dummyStore();
      store.dispatch = sinon.spy();

      menu.dispatchPasteCell(store);

      expect(store.dispatch.firstCall).to.be.calledWith({
        type: constants.PASTE_CELL
      });
    });
  });

  describe("dispatchCutCell", () => {
    it("dispatches a CUT_CELL action", () => {
      const store = dummyStore();
      store.dispatch = sinon.spy();

      menu.dispatchCutCell(store);

      expect(store.dispatch.firstCall).to.be.calledWith({
        type: constants.CUT_CELL,
        id: null
      });
    });
  });

  describe("dispatchCopyCell", () => {
    it("dispatches a COPY_CELL action", () => {
      const store = dummyStore();
      store.dispatch = sinon.spy();

      menu.dispatchCopyCell(store);

      expect(store.dispatch.firstCall).to.be.calledWith({
        type: constants.COPY_CELL,
        id: null
      });
    });
  });

  describe("dispatchSetTheme", () => {
    it("dispatches a SET_CONFIG_KEY action", () => {
      const store = dummyStore();
      store.dispatch = sinon.spy();

      menu.dispatchSetTheme(store, {}, "test_theme");

      expect(store.dispatch.firstCall).to.be.calledWith({
        type: constants.SET_CONFIG_KEY,
        key: "theme",
        value: "test_theme"
      });
    });
  });
  describe("dispatchSetCursorBlink", () => {
    it("dispatches a SET_CONFIG_KEY action", () => {
      const store = dummyStore();
      store.dispatch = sinon.spy();

      menu.dispatchSetCursorBlink(store, {}, 42);

      expect(store.dispatch.firstCall).to.be.calledWith({
        type: constants.SET_CONFIG_KEY,
        key: "cursorBlinkRate",
        value: 42
      });
    });
  });

  describe("dispatchLoadConfig", () => {
    it("dispatches a LOAD_CONFIG action", () => {
      const store = dummyStore();
      store.dispatch = sinon.spy();

      menu.dispatchLoadConfig(store);

      expect(store.dispatch.firstCall).to.be.calledWith({
        type: "LOAD_CONFIG"
      });
    });
  });

  describe("dispatchZoomOut", () => {
    it("executes zoom out", () => {
      const setZoomLevel = sinon.spy(webFrame, "setZoomLevel");
      menu.dispatchZoomOut();
      setZoomLevel.restore();
      expect(setZoomLevel).to.be.called;
    });
  });

  describe("dispatchZoomIn", () => {
    it("executes zoom in", () => {
      const setZoomLevel = sinon.spy(webFrame, "setZoomLevel");
      menu.dispatchZoomIn();
      setZoomLevel.restore();
      expect(setZoomLevel).to.be.called;
    });
  });

  describe("dispatchZoomReset", () => {
    it("executes zoom reset", () => {
      const setZoomLevel = sinon.spy(webFrame, "setZoomLevel");
      menu.dispatchZoomReset();
      setZoomLevel.restore();
      expect(setZoomLevel).to.be.calledWith(0);
    });
  });

  describe("dispatchRestartClearAll", () => {
    it("dispatches KILL_KERNEL and CLEAR_OUTPUTS actions", () => {
      const store = dummyStore();
      store.dispatch = sinon.spy();

      menu.dispatchRestartClearAll(store);

      expect(store.dispatch.firstCall).to.be.calledWith({
        type: constants.KILL_KERNEL
      });
    });
  });

  describe("dispatchRestartKernel", () => {
    it("dispatches KILL_KERNEL and NEW_KERNEL actions", () => {
      const store = dummyStore();
      store.dispatch = sinon.spy();

      menu.dispatchRestartKernel(store);

      expect(store.dispatch.firstCall).to.be.calledWith({
        type: constants.KILL_KERNEL
      });
    });
  });

  describe("dispatchInterruptKernel", () => {
    it("dispatches INTERRUPT_KERNEL actions", () => {
      const store = dummyStore();
      store.dispatch = sinon.spy();

      menu.dispatchInterruptKernel(store);

      if (process.platform !== "win32") {
        expect(store.dispatch.firstCall).to.be.calledWith({
          type: constants.INTERRUPT_KERNEL
        });
      }
    });
  });

  describe("dispatchKillKernel", () => {
    it("dispatches KILL_KERNEL actions", () => {
      const store = dummyStore();
      store.dispatch = sinon.spy();

      menu.dispatchKillKernel(store);

      expect(store.dispatch.firstCall).to.be.calledWith({
        type: constants.KILL_KERNEL
      });
    });
  });

  describe("dispatchClearAll", () => {
    it("dispatches CLEAR_OUTPUTS actions", () => {
      const store = dummyStore();
      store.dispatch = sinon.spy();

      menu.dispatchClearAll(store);

      expect(store.dispatch.firstCall).to.be.calledWith({
        type: constants.CLEAR_OUTPUTS,
        id: store.getState().document.getIn(["notebook", "cellOrder"]).first()
      });
    });
  });

  describe("dispatchRunAllBelow", () => {
    it("runs all code cells below the focused cell", () => {
      const store = dummyStore({ codeCellCount: 4, markdownCellCount: 4 });
      const markdownCells = store
        .getState()
        .document.getIn(["notebook", "cellMap"])
        .filter(cell => cell.get("cell_type") === "markdown");
      store.dispatch = sinon.spy();

      menu.dispatchRunAllBelow(store);

      expect(store.dispatch.calledThrice).to.equal(true);
      markdownCells.forEach(cellId => {
        expect(
          store.dispatch.neverCalledWith({
            type: "EXECUTE_CELL",
            id: cellId,
            source: ""
          })
        ).to.equal(true);
      });
    });
  });

  describe("dispatchRunAll", () => {
    it("dispatches EXECUTE_CELL for all cells action", () => {
      const store = dummyStore();
      store.dispatch = sinon.spy();

      menu.dispatchRunAll(store);

      const first = store
        .getState()
        .document.getIn(["notebook", "cellOrder"])
        .first();
      expect(store.dispatch.firstCall).to.be.calledWith({
        type: "EXECUTE_CELL",
        id: first,
        source: store
          .getState()
          .document.getIn(["notebook", "cellMap", first, "source"])
      });
    });
  });

  describe("dispatchUnhideAll", () => {
    it("dispatches changeInputVisibility for hidden code cells", () => {
      const store = dummyStore({ hideAll: true });
      store.dispatch = sinon.spy();

      menu.dispatchUnhideAll(store);

      const first = store
        .getState()
        .document.getIn(["notebook", "cellOrder"])
        .first();
      const expectedAction = { type: "CHANGE_INPUT_VISIBILITY", id: first };
      expect(store.dispatch.firstCall).to.be.calledWith(expectedAction);
    });
  });

  describe("dispatchPublishAnonGist", () => {
    it("dispatches PUBLISH_ANONYMOUS_GIST action", () => {
      const store = dummyStore();
      store.dispatch = sinon.spy();
      menu.dispatchPublishAnonGist(store);
      expect(store.dispatch.firstCall).to.be.calledWith({
        type: "PUBLISH_ANONYMOUS_GIST"
      });
    });
  });

  describe("dispatchPublishUserGist", () => {
    it("sets github token if token provided", () => {
      const store = dummyStore();
      store.dispatch = sinon.spy();
      menu.dispatchPublishUserGist(store, {}, "TOKEN");
      const expectedAction = { type: "SET_GITHUB_TOKEN", githubToken: "TOKEN" };
      expect(store.dispatch).to.have.been.calledWith(expectedAction);
    });
    it("dispatches setUserGithub and publishes gist", () => {
      const store = dummyStore();
      store.dispatch = sinon.spy();
      menu.dispatchPublishUserGist(store, {});
      const expectedSecondAction = { type: "PUBLISH_USER_GIST" };
      expect(store.dispatch).to.have.been.calledWith(expectedSecondAction);
    });
  });

  describe("dispatchNewKernel", () => {
    it("dispatches LAUNCH_KERNEL action", () => {
      const store = dummyStore();
      store.dispatch = sinon.spy();

      menu.dispatchNewKernel(store, {}, { spec: "hokey" });

      expect(store.dispatch.firstCall).to.be.calledWith({
        type: constants.LAUNCH_KERNEL,
        kernelSpec: { spec: "hokey" },
        cwd: process.cwd()
      });
    });
  });

  describe("dispatchSave", () => {
    it("sends as SAVE request if given a filename", () => {
      const store = dummyStore();
      store.dispatch = sinon.spy();

      menu.dispatchSave(store);

      expect(store.dispatch.firstCall).to.be.calledWith({
        type: "SAVE",
        filename: store.getState().metadata.get("filename"),
        notebook: store.getState().document.get("notebook")
      });
    });
  });

  describe("dispatchSaveAs", () => {
    it("dispatches SAVE_AS action", () => {
      const store = dummyStore();
      store.dispatch = sinon.spy();

      menu.dispatchSaveAs(store, {}, "test-ipynb.ipynb");
      expect(store.dispatch.firstCall).to.be.calledWith({
        type: "SAVE_AS",
        filename: "test-ipynb.ipynb",
        notebook: store.getState().document.get("notebook")
      });
    });
  });

  describe("dispatchLoad", () => {
    it("dispatches LOAD action", () => {
      const store = dummyStore();
      store.dispatch = sinon.spy();

      menu.dispatchLoad(store, {}, "test-ipynb.ipynb");
      expect(store.dispatch.firstCall).to.be.calledWith({
        type: "LOAD",
        filename: "test-ipynb.ipynb"
      });
    });
  });

  describe("dispatchNewNotebook", () => {
    it("dispatches a NEW_NOTEBOOK action", () => {
      const store = dummyStore();
      store.dispatch = sinon.spy();

      menu.dispatchNewNotebook(store, {}, { spec: "hokey" });
      expect(store.dispatch.firstCall).to.be.calledWith({
        type: "NEW_NOTEBOOK",
        kernelSpec: { spec: "hokey" },
        cwd: process.cwd()
      });
    });
  });

  describe("initMenuHandlers", () => {
    it("registers the menu events", () => {
      const store = dummyStore();
      const ipcOn = sinon.spy(ipc, "on");
      menu.initMenuHandlers(store);
      [
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
        expect(ipcOn).to.have.been.calledWith(name);
      });
    });
  });

  describe("showSaveAsDialog", () => {
    it("returns a promise", () => {
      const dialog = menu.showSaveAsDialog();
      expect(dialog).to.be.a("promise");
    });
  });

  describe("triggerWindowRefresh", () => {
    it("does nothing if no filename is given", () => {
      const store = dummyStore();

      expect(menu.triggerWindowRefresh(store, null)).to.be.undefined;
    });
    it("sends a SAVE_AS action if given filename", () => {
      const store = dummyStore();
      const filename = "dummy-nb.ipynb";
      store.dispatch = sinon.spy();

      menu.triggerWindowRefresh(store, filename);

      expect(store.dispatch.firstCall).to.be.calledWith({
        type: "SAVE_AS",
        notebook: store.getState().document.get("notebook"),
        filename
      });
    });
  });

  describe("exportPDF", () => {
    it("it notifies a user upon successful write", () => {
      const store = dummyStore();
      const notificationSystem = NotificationSystem();
      const addNotification = sinon.spy(notificationSystem, "addNotification");
      const filename = "thisisafilename.ipynb";
      menu.exportPDF(store, filename, notificationSystem);
      expect(addNotification).to.have.been.calledWithMatch({
        title: "PDF exported",
        message: `Notebook ${filename} has been exported as a pdf.`,
        dismissible: true,
        position: "tr",
        level: "success"
      });
    });
  });
  describe("triggerSaveAsPDF", () => {
    it("does something", () => {});
  });

  describe("storeToPDF", () => {
    it("triggers notification when not saved", () => {
      const config = { noFilename: true };
      const store = dummyStore(config);
      const addNotification = store.getState().app.get("notificationSystem")
        .addNotification;
      menu.storeToPDF(store);
      expect(addNotification).to.have.been.calledWithMatch({
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
    it("calls export PDF when filename exists", () => {
      // const exportStub = sinon.spy(menu.exportPDF);
      const store = dummyStore();
      const addNotification = store.getState().app.get("notificationSystem")
        .addNotification;
      menu.storeToPDF(store);
      expect(addNotification).to.have.been.calledWithMatch({
        title: "PDF exported",
        message: "Notebook dummy-store-nb has been exported as a pdf.",
        dismissible: true,
        position: "tr",
        level: "success"
      });
    });
  });
});
