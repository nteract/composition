jest.mock("fs");
import { webFrame, ipcRenderer as ipc } from "electron";
import { actions, actionTypes } from "@nteract/core";
import * as Immutable from "immutable";

import * as menu from "../../src/notebook/menu";

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
describe("dispatchCreateRawCellBelow", () => {
  test("dispatches a CREATE_CELL_BELOW with raw action", () => {
    const store = {
      dispatch: jest.fn()
    };
    const props = {
      contentRef: "123"
    };

    menu.dispatchCreateTextCellBelow(props, store);
    expect(store.dispatch).toHaveBeenCalledWith(
      actions.createCellBelow({
        cellType: "raw",
        source: "",
        contentRef: "123"
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

describe("dispatchCreateCellBefore", () => {
  test("WARNING: DEPRECATED. Use createCellAbove() instead. dispatches a CREATE_CELL_BEFORE with code action", () => {
    const store = {
      dispatch: jest.fn()
    };
    const props = {
      contentRef: "123"
    };

    menu.dispatchCreateCellBefore(props, store);
    expect(store.dispatch).toHaveBeenCalledWith(
      actions.createCellBefore({
        cellType: "code",
        contentRef: props.contentRef
      })
    );
  });
});

describe("dispatchCreateCellAfter", () => {
  test("WARNING: DEPRECATED. Use createCellBelow() instead. dispatches a CREATE_CELL_AFTER with code action", () => {
    const store = {
      dispatch: jest.fn()
    };
    const props = {
      contentRef: "123"
    };

    menu.dispatchCreateCellAfter(props, store);
    expect(store.dispatch).toHaveBeenCalledWith(
      actions.createCellAfter({
        cellType: "code",
        source: "",
        contentRef: props.contentRef
      })
    );
  });
});

describe("dispatchCreateTextCellAfter", () => {
  test("WARNING:DEPRECATED. dispatches a CREATE_CELL_AFTER with markdown action", () => {
    const store = {
      dispatch: jest.fn()
    };
    const props = {
      contentRef: "123"
    };

    menu.dispatchCreateTextCellAfter(props, store);
    expect(store.dispatch).toHaveBeenCalledWith(
      actions.createCellAfter({
        cellType: "markdown",
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
      type: actionTypes.SET_CONFIG_AT_KEY,
      key: "theme",
      value: "test_theme"
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
      type: actionTypes.SET_CONFIG_AT_KEY,
      key: "cursorBlinkRate",
      value: 42
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
      type: actionTypes.RESTART_KERNEL,
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
    const notificationSystem = { addNotification: jest.fn() };
    const store = {
      dispatch: jest.fn(),
      getState: () => ({
        app: Immutable.Map(notificationSystem),
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
        type: actionTypes.INTERRUPT_KERNEL,
        payload: {
          kernelRef: "k1"
        }
      });
    } else {
      expect(notificationSystem.addNotification).toHaveBeenCalled();
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
      type: actionTypes.KILL_KERNEL,
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

    menu.dispatchPublishGist(props, store, {});
    expect(store.dispatch).toHaveBeenCalledWith({
      type: actionTypes.PUBLISH_GIST,
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
      type: actionTypes.LAUNCH_KERNEL,
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

    menu.dispatchNewNotebook(props, store, {}, { spec: "hokey" });
    expect(store.dispatch).toHaveBeenCalledWith({
      type: "NEW_NOTEBOOK",
      payload: {
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

    expect(menu.triggerWindowRefresh(store, null)).toBeUndefined();
  });
  test("sends a SAVE_AS action if given filename", () => {
    const props = {
      contentRef: "123"
    };

    const store = {
      dispatch: jest.fn()
    };
    const filepath = "dummy-nb.ipynb";

    menu.triggerWindowRefresh(props, store, filepath);

    expect(store.dispatch).toHaveBeenCalledWith(
      actions.saveAs({
        filepath,
        contentRef: "123"
      })
    );
  });
});

describe("exportPDF", () => {
  test.skip("it notifies a user upon successful write", () => {
    const store = {
      dispatch: jest.fn()
    };
    const notificationSystem = { addNotification: jest.fn() };
    const filepath = "thisisafilename.ipynb";
    menu.exportPDF(store, filepath, notificationSystem);
    expect(notificationSystem.addNotification).toHaveBeenCalledWith({
      title: "PDF exported",
      message: `Notebook ${filepath} has been exported as a pdf.`,
      dismissible: true,
      position: "tr",
      level: "success"
    });
  });
});

describe("storeToPDF", () => {
  test("triggers notification when not saved", () => {
    const props = {
      contentRef: "123"
    };

    const notificationSystem = { addNotification: jest.fn() };

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
          notificationSystem
        })
      })
    };

    menu.storeToPDF(props, store);
    expect(notificationSystem.addNotification).toHaveBeenCalledWith({
      action: { callback: expect.any(Function), label: "Save As" },
      title: "File has not been saved!",
      message: [
        "Click the button below to save the notebook so that it can be ",
        "exported as a PDF."
      ],
      dismissible: true,
      position: "tr",
      level: "warning"
    });
  });
});
