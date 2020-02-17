jest.mock("fs");
import { actions, selectors } from "@nteract/core";

import { mockAppState } from "@nteract/fixtures";
import { sendNotification } from "@nteract/mythic-notifications";
import { ipcRenderer as ipc, remote, webFrame } from "electron";
import * as Immutable from "immutable";

import * as menu from "../../src/notebook/menu";
import { exportPDF, storeToPDF } from "../../src/notebook/menu-export-pdf";
import { dispatchPublishGist } from "../../src/notebook/menu-publish-gist";
import { promptUserAboutNewKernel, showSaveAsDialog, triggerWindowRefresh } from "../../src/notebook/menu_save";

describe("dispatchCreateCellAbove", () => {
  test("dispatches a CREATE_CELL_ABOVE with code action", () => {
    const store = {
      dispatch: jest.fn()
    };
    const props = {
      contentRef: "123"
    };

    menu.dispatchCreateCellAbove(props, store);
    expect(store.dispatch).toHaveBeenCalledWith(
      actions.createCellAbove({
        cellType: "code",
        contentRef: props.contentRef
      })
    );
  });
});

describe("dispatchCreateCellBelow", () => {
  test("dispatches a CREATE_CELL_BELOW with code action", () => {
    const store = {
      dispatch: jest.fn()
    };
    const props = {
      contentRef: "123"
    };

    menu.dispatchCreateCellBelow(props, store);
    expect(store.dispatch).toHaveBeenCalledWith(
      actions.createCellBelow({
        cellType: "code",
        source: "",
        contentRef: props.contentRef
      })
    );
  });
});

describe("dispatchCreateTextCellBelow", () => {
  test("dispatches a CREATE_CELL_BELOW with markdown action", () => {
    const store = {
      dispatch: jest.fn()
    };
    const props = {
      contentRef: "123"
    };

    menu.dispatchCreateTextCellBelow(props, store);
    expect(store.dispatch).toHaveBeenCalledWith(
      actions.createCellBelow({
        cellType: "markdown",
        source: "",
        contentRef: "123"
      })
    );
  });
});
describe("dispatchCreateRawCellBelow", () => {
  test("dispatches a CREATE_RAW_BELOW with raw action", () => {
    const store = {
      dispatch: jest.fn()
    };
    const props = {
      contentRef: "123"
    };

    menu.dispatchCreateRawCellBelow(props, store);
    expect(store.dispatch).toHaveBeenCalledWith(
      actions.createCellBelow({
        cellType: "raw",
        source: "",
        contentRef: "123"
      })
    );
  });
});

describe("dispatchDeleteCell", () => {
  test("dispatches a DELETE_CELL on currently active cell", () => {
    const store = {
      dispatch: jest.fn()
    };
    const props = {
      contentRef: "123"
    };

    menu.dispatchDeleteCell(props, store);
    expect(store.dispatch).toHaveBeenCalledWith(
      actions.deleteCell({
        contentRef: props.contentRef
      })
    );
  });
});

describe("dispatchChangeCellToCode", () => {
  test("dispatches a CHANGE_CELL_TYPE with code action", () => {
    const store = {
      dispatch: jest.fn()
    };
    const props = {
      contentRef: "123"
    };

    menu.dispatchChangeCellToCode(props, store);
    expect(store.dispatch).toHaveBeenCalledWith(
      actions.changeCellType({
        to: "code",
        contentRef: props.contentRef
      })
    );
  });
});

describe("dispatchChangeCellToText", () => {
  test("dispatches a CHANGE_CELL_TYPE with code action", () => {
    const store = {
      dispatch: jest.fn()
    };
    const props = {
      contentRef: "123"
    };

    menu.dispatchChangeCellToText(props, store);
    expect(store.dispatch).toHaveBeenCalledWith(
      actions.changeCellType({
        to: "markdown",
        contentRef: props.contentRef
      })
    );
  });
});

describe("dispatchPasteCell", () => {
  test("dispatches a pasteCell action", () => {
    const store = {
      dispatch: jest.fn()
    };
    const props = {
      contentRef: "123"
    };

    menu.dispatchPasteCell(props, store);
    expect(store.dispatch).toHaveBeenCalledWith(
      actions.pasteCell({
        contentRef: "123"
      })
    );
  });
});

describe("dispatchCutCell", () => {
  test("dispatches a cutCell action", () => {
    const store = {
      dispatch: jest.fn()
    };
    const props = {
      contentRef: "123"
    };

    menu.dispatchCutCell(props, store);
    expect(store.dispatch).toHaveBeenCalledWith(
      actions.cutCell({
        contentRef: "123"
      })
    );
  });
});

describe("dispatchCopyCell", () => {
  test("dispatches a copyCell action", () => {
    const store = {
      dispatch: jest.fn()
    };
    const props = {
      contentRef: "123"
    };
    menu.dispatchCopyCell(props, store);
    expect(store.dispatch).toHaveBeenCalledWith(
      actions.copyCell({
        contentRef: "123"
      })
    );
  });
});

describe("dispatchSetTheme", () => {
  test("dispatches a SET_CONFIG_AT_KEY action", () => {
    const store = {
      dispatch: jest.fn()
    };
    const props = {
      contentRef: "123"
    };

    menu.dispatchSetTheme(props, store, {}, "test_theme");

    expect(store.dispatch).toHaveBeenCalledWith({
      type: actions.SET_CONFIG_AT_KEY,
      payload: {
        key: "theme",
        value: "test_theme"
      }
    });
  });
});
describe("dispatchSetCursorBlink", () => {
  test("dispatches a SET_CONFIG_AT_KEY action", () => {
    const store = {
      dispatch: jest.fn()
    };
    const props = {
      contentRef: "123"
    };

    menu.dispatchSetCursorBlink(props, store, {}, 42);

    expect(store.dispatch).toHaveBeenCalledWith({
      type: actions.SET_CONFIG_AT_KEY,
      payload: {
        key: "cursorBlinkRate",
        value: 42
      }
    });
  });
});

describe("dispatchLoadConfig", () => {
  test("dispatches a LOAD_CONFIG action", () => {
    const store = {
      dispatch: jest.fn()
    };
    const props = {
      contentRef: "123"
    };

    menu.dispatchLoadConfig(props, store);

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

describe("dispatchRestartKernel", () => {
  test("dispatches restart kernel with supplied outputHandling", () => {
    const store = {
      dispatch: jest.fn(),
      getState: () => ({
        core: {
          entities: {
            contents: {
              byRef: Immutable.Map({
                "123": {
                  filepath: "yep.ipynb",
                  model: {
                    type: "notebook",
                    kernelRef: "k1"
                  }
                }
              })
            },
            kernels: {
              byRef: Immutable.Map({
                k1: {}
              })
            }
          }
        }
      })
    };
    const props = {
      contentRef: "123"
    };

    menu.dispatchRestartKernel(props, store, "Clear All");

    expect(store.dispatch).toHaveBeenCalledWith({
      type: actions.RESTART_KERNEL,
      payload: {
        outputHandling: "Clear All",
        kernelRef: "k1",
        contentRef: "123"
      }
    });
  });
});

describe("dispatchInterruptKernel", () => {
  test("dispatches INTERRUPT_KERNEL actions", () => {
    const store = {
      dispatch: jest.fn(),
      getState: () => ({
        app: Immutable.Map({}),
        core: {
          entities: {
            contents: {
              byRef: Immutable.Map({
                "123": {
                  filepath: "yep.ipynb",
                  model: {
                    type: "notebook",
                    kernelRef: "k1"
                  }
                }
              })
            },
            kernels: {
              byRef: Immutable.Map({
                k1: {}
              })
            }
          }
        }
      })
    };
    const props = {
      contentRef: "123"
    };

    menu.dispatchInterruptKernel(props, store);

    if (process.platform !== "win32") {
      expect(store.dispatch).toHaveBeenCalledWith({
        type: actions.INTERRUPT_KERNEL,
        payload: {
          kernelRef: "k1",
          contentRef: "123"
        }
      });
    }
  });
});

describe("dispatchKillKernel", () => {
  test("dispatches KILL_KERNEL actions", () => {
    const store = {
      dispatch: jest.fn(),
      getState: () => ({
        core: {
          entities: {
            contents: {
              byRef: Immutable.Map({
                "123": {
                  filepath: "yep.ipynb",
                  model: {
                    type: "notebook",
                    kernelRef: "k1"
                  }
                }
              })
            },
            kernels: {
              byRef: Immutable.Map({
                k1: {}
              })
            }
          }
        }
      })
    };
    const props = {
      contentRef: "123"
    };

    menu.dispatchKillKernel(props, store);

    expect(store.dispatch).toHaveBeenCalledWith({
      type: actions.KILL_KERNEL,
      payload: {
        restarting: false,
        kernelRef: "k1"
      }
    });
  });
});

describe("dispatchClearAll", () => {
  test("dispatches CLEAR_ALL_OUTPUTS actions", () => {
    const store = {
      dispatch: jest.fn()
    };
    const props = {
      contentRef: "123"
    };

    menu.dispatchClearAll(props, store);

    expect(store.dispatch).toHaveBeenCalledWith(
      actions.clearAllOutputs({
        contentRef: "123"
      })
    );
  });
});

describe("dispatchRunAllBelow", () => {
  test("runs all code cells below the focused cell", () => {
    const store = {
      dispatch: jest.fn()
    };
    const props = {
      contentRef: "123"
    };

    menu.dispatchRunAllBelow(props, store);
    expect(store.dispatch).toHaveBeenCalledWith(
      actions.executeAllCellsBelow({
        contentRef: "123"
      })
    );
  });
});

describe("dispatchRunAll", () => {
  test("dispatches executeAllCells action", () => {
    const store = {
      dispatch: jest.fn()
    };
    const props = {
      contentRef: "123"
    };
    menu.dispatchRunAll(props, store);
    expect(store.dispatch).toHaveBeenCalledWith(
      actions.executeAllCells({
        contentRef: "123"
      })
    );
  });
});

describe("dispatchUnhideAll", () => {
  test("", () => {
    const store = {
      dispatch: jest.fn()
    };
    const props = {
      contentRef: "123"
    };
    menu.dispatchUnhideAll(props, store);
    expect(store.dispatch).toHaveBeenCalledWith(
      actions.unhideAll({
        outputHidden: false,
        inputHidden: false,
        contentRef: "123"
      })
    );
  });
});

// FIXME LEFT OFF HERE needing to either mock more or move more of the github logic to an epic
describe("dispatchPublishUserGist", () => {
  test("dispatches setUserGithub and publishes gist", () => {
    const store = {
      dispatch: jest.fn(),
      getState: () => ({
        app: Immutable.Map({
          githubToken: "MYTOKEN"
        })
      })
    };
    const props = {
      contentRef: "123"
    };

    dispatchPublishGist(props, store, {});
    expect(store.dispatch).toHaveBeenCalledWith({
      type: actions.PUBLISH_GIST,
      payload: {
        contentRef: "123"
      }
    });
  });
});

describe("dispatchNewKernel", () => {
  test("dispatches LAUNCH_KERNEL action", () => {
    const store = {
      dispatch: jest.fn(),
      getState: () => ({
        core: {
          entities: {
            contents: {
              byRef: Immutable.Map()
            },
            kernels: {
              byRef: {}
            }
          }
        }
      })
    };
    const props = {
      contentRef: "123"
    };

    menu.dispatchNewKernel(props, store, {}, { spec: "hokey" });

    expect(store.dispatch).toHaveBeenCalledWith({
      type: actions.LAUNCH_KERNEL,
      payload: {
        kernelSpec: { spec: "hokey" },
        cwd: process.cwd(),
        selectNextKernel: true,
        kernelRef: expect.any(String),
        contentRef: "123"
      }
    });
  });
});

// FIXME COME BACK TO THIS -- make sure save is in a good state
describe("dispatchSave", () => {
  test("sends as SAVE request if given a filename", () => {
    const store = {
      dispatch: jest.fn(),
      getState: () => ({
        core: {
          entities: {
            contents: {
              byRef: Immutable.Map({
                "123": {
                  filepath: "yep.ipynb"
                }
              })
            },
            kernels: {
              byRef: {}
            }
          }
        }
      })
    };
    const props = {
      contentRef: "123"
    };
    menu.dispatchSave(props, store);
    expect(store.dispatch).toHaveBeenCalledWith(
      actions.save({
        contentRef: "123"
      })
    );
  });
});

describe("dispatchSaveAs", () => {
  test("dispatches SAVE_AS action", () => {
    const store = {
      dispatch: jest.fn(),
      getState: () => ({
        core: {
          entities: {
            contents: {
              byRef: Immutable.Map()
            },
            kernels: {
              byRef: {}
            }
          }
        }
      })
    };
    const props = {
      contentRef: "123"
    };
    menu.dispatchSaveAs(props, store, {}, "test-ipynb.ipynb");
    expect(store.dispatch).toHaveBeenCalledWith(
      actions.saveAs({
        filepath: "test-ipynb.ipynb",
        contentRef: "123"
      })
    );
  });
});

describe("dispatchLoad", () => {
  test("dispatches LOAD action", () => {
    const store = {
      dispatch: jest.fn()
    };
    const props = {
      contentRef: "123"
    };

    menu.dispatchLoad(props, store, {}, "test-ipynb.ipynb");
    expect(store.dispatch).toHaveBeenCalledWith({
      type: "CORE/FETCH_CONTENT",
      payload: {
        filepath: "test-ipynb.ipynb",
        params: {},
        kernelRef: expect.any(String),
        contentRef: "123"
      }
    });
  });
});

describe("dispatchNewNotebook", () => {
  test("dispatches a NEW_NOTEBOOK action", () => {
    const store = {
      dispatch: jest.fn()
    };
    const props = {
      contentRef: "123"
    };

    menu.dispatchNewNotebook(props, store, {}, null, { spec: "hokey" });
    expect(store.dispatch).toHaveBeenCalledWith({
      type: "NEW_NOTEBOOK",
      payload: {
        filepath: null,
        kernelSpec: { spec: "hokey" },
        cwd: process.cwd(),
        kernelRef: expect.any(String),
        contentRef: "123"
      }
    });
  });
});

describe("dispatchNewNotebookNamed", () => {
  test("dispatches a NEW_NOTEBOOK action with name", () => {
    const store = {
      dispatch: jest.fn()
    };
    const props = {
      contentRef: "123"
    };

    menu.dispatchNewNotebook(props, store, {}, "some.ipynb", { spec: "hokey" });
    expect(store.dispatch).toHaveBeenCalledWith({
      type: "NEW_NOTEBOOK",
      payload: {
        filepath: "some.ipynb",
        kernelSpec: { spec: "hokey" },
        cwd: process.cwd(),
        kernelRef: expect.any(String),
        contentRef: "123"
      }
    });
  });
});

describe("initMenuHandlers", () => {
  test("registers the menu events", () => {
    const store = {
      dispatch: jest.fn()
    };
    const props = {
      contentRef: "123"
    };

    ipc.on = jest.fn();

    menu.initMenuHandlers(props.contentRef, store);
    [
      "main:load-config",
      "menu:exportPDF",
      "menu:new-kernel",
      "menu:run-all",
      "menu:clear-all",
      "menu:unhide-all",
      "menu:save",
      "menu:save-as",
      "menu:new-text-cell-below",
      "menu:new-raw-cell-below",
      "menu:new-code-cell-above",
      "menu:new-code-cell-below",
      "menu:copy-cell",
      "menu:cut-cell",
      "menu:paste-cell",
      "menu:kill-kernel",
      "menu:interrupt-kernel",
      "menu:restart-kernel",
      "menu:restart-and-clear-all",
      "menu:restart-and-run-all",
      "menu:publish:gist",
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

describe("triggerWindowRefresh", () => {
  test("does nothing if no filename is given", () => {
    const store = {
      dispatch: jest.fn()
    };

    expect(triggerWindowRefresh(store, null)).toBeUndefined();
  });
  test("sends a SAVE_AS action if given filename", () => {
    const props = {
      contentRef: "123"
    };

    const store = {
      dispatch: jest.fn()
    };
    const filepath = "dummy-nb.ipynb";

    triggerWindowRefresh(props, store, filepath);

    expect(store.dispatch).toHaveBeenCalledWith(
      actions.saveAs({
        filepath,
        contentRef: "123"
      })
    );
  });
});

describe("exportPDF", () => {
  test("it notifies a user upon successful write", () => {
    const state = mockAppState({});
    const contentRef: string = state.core.entities.contents.byRef
      .keySeq()
      .first();
    const store = {
      dispatch: jest.fn(),
      getState: jest.fn(() => state),
    };
    const filepath = "thisisafilename.ipynb";
    exportPDF({ contentRef }, store, filepath);
    expect(store.dispatch).toHaveBeenCalledWith(
      sendNotification.create({
        title: "PDF exported",
        message: expect.anything(),
        level: "success",
        action: {
          label: "Open",
          callback: expect.any(Function),
        },
      }),
    );
  });
});

describe("storeToPDF", () => {
  test("triggers notification when not saved", () => {
    const props = {
      contentRef: "123"
    };

    const store = {
      dispatch: jest.fn(),
      getState: () => ({
        core: {
          entities: {
            contents: {
              byRef: Immutable.Map({
                "123": {
                  filepath: null
                }
              })
            }
          }
        },
      })
    };

    storeToPDF(props, store);
    expect(store.dispatch).toHaveBeenCalledWith(
      sendNotification.create({
        action: { callback: expect.any(Function), label: "Save As" },
        title: "File has not been saved!",
        message: expect.stringContaining(
          "Click the button below to save the notebook"
        ),
        level: "warning"
      }),
    );
  });
});

describe("dispatchInterruptKernel", () => {
  test("dispatches an INTERRUPT_KERNEL action", () => {
    const state = mockAppState({});
    const contentRef: string = state.core.entities.contents.byRef
      .keySeq()
      .first();
    const kernelRef = selectors.kernelRefByContentRef(state, { contentRef });
    const store = {
      dispatch: jest.fn(),
      getState: jest.fn(() => state)
    };
    const props = {
      contentRef
    };

    menu.dispatchInterruptKernel(props, store);
    expect(store.dispatch).toHaveBeenCalledWith(
      actions.interruptKernel({
        contentRef,
        kernelRef
      })
    );
  });
});

describe("exportPDF", () => {
  it("throws an error if provided value is not a notebook", () => {
    const store = {
      dispatch: jest.fn(),
      getState: () => ({
        core: {
          entities: {
            contents: {
              byRef: Immutable.Map({
                "123": {
                  filepath: null
                }
              })
            }
          }
        },
        app: Immutable.Map({
        })
      })
    };

    const invocation = () =>
      exportPDF(
        { contentRef: "abc" },
        store,
        "my-notebook.pdf",
      );
    expect(invocation).toThrow();
  });
  it("unhides hidden cells before exporting to PDF", () => {
    const state = mockAppState({ hideAll: true });
    const contentRef: string = state.core.entities.contents.byRef
      .keySeq()
      .first();
    const store = {
      dispatch: jest.fn(),
      getState: jest.fn(() => state)
    };
    const props = { contentRef };

    exportPDF(props, store, "my-notebook");
    expect(store.dispatch).toBeCalledWith({
      type: actions.TOGGLE_OUTPUT_EXPANSION,
      payload: {
        id: expect.any(String),
        contentRef
      }
    });
  });
});

describe("dispatchSetConfigAtKey", () => {
  test("dispatches a setConfigAtKey action", () => {
    const store = {
      dispatch: jest.fn()
    };
    const props = {
      contentRef: "123"
    };
    const key = "key";
    const value = "value";
    menu.dispatchSetConfigAtKey(
      props,
      store,
      key,
      new Event("testEvet"),
      value
    );
    expect(store.dispatch).toHaveBeenCalledWith(
      actions.setConfigAtKey(key, value)
    );
  });
});

describe("showSaveAsDialog", () => {
  it("shows the saveAs dialog", () => {
    showSaveAsDialog().then(filepath => {
      expect(remote.dialog.showSaveAsDialog).toBeCalled();
    });
  });
});

describe("promptUserAboutNewKernel", () => {
  it("shows a message box for restarting a new kernel", () => {
    const state = mockAppState({});
    const contentRef: string = state.core.entities.contents.byRef
      .keySeq()
      .first();
    const store = {
      dispatch: jest.fn(),
      getState: jest.fn(() => state)
    };
    promptUserAboutNewKernel({ contentRef }, store, "file.ipynb")
      .then(filepath => {
        expect(remote.dialog.showMessageBox).toBeCalled();
      });
  });
});
