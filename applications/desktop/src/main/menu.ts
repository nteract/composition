import * as path from "path";

import { manifest } from "@nteract/examples";
import {
  app,
  BrowserWindow,
  dialog,
  FileFilter,
  Menu,
  shell,
  WebContents
} from "electron";
import { sortBy } from "lodash";

import { KernelspecInfo } from "@nteract/types";
import { installShellCommand } from "./cli";
import { launch, launchNewNotebook } from "./launch";

function send(
  focusedWindow: BrowserWindow,
  eventName: string,
  obj?: object | string | number
): void {
  if (!focusedWindow) {
    console.error("renderer window not in focus (are your devtools open?)");
    return;
  }
  focusedWindow.webContents.send(eventName, obj);
}

type Sender = (item: object, focusedWindow: BrowserWindow) => void;

function createSender(
  eventName: string,
  obj?: object | string | number,
): Sender {
  return (item: object, focusedWindow: BrowserWindow) => {
    send(focusedWindow, eventName, obj);
  };
}

const windowDraft = {
  label: "Window",
  role: "window",
  submenu: [
    {
      label: "Minimize",
      accelerator: "CmdOrCtrl+M",
      role: "minimize"
    },
    {
      label: "Close",
      accelerator: "CmdOrCtrl+W",
      role: "close"
    }
  ] as any[]
};

if (process.platform === "darwin") {
  windowDraft.submenu.push(
    {
      type: "separator"
    },
    {
      label: "Bring All to Front",
      role: "front"
    }
  );
}

export const window = windowDraft;

const shellCommands = {
  label: "Install Shell Commands",
  click: () => installShellCommand()
};

const helpDraft = {
  label: "Help",
  role: "help",
  submenu: [
    {
      label: "Documentation",
      click: () => {
        shell.openExternal("https://docs.nteract.io");
      }
    },
    {
      label: "Keyboard Shortcuts",
      click: () => {
        shell.openExternal("https://docs.nteract.io/#/desktop/shortcut-keys");
      }
    },
    {
      label: "View nteract on GitHub",
      click: () => {
        shell.openExternal("http://github.com/nteract/nteract");
      }
    },
    {
      label: `Release Notes (${app.getVersion()})`,
      click: () => {
        shell.openExternal(
          `https://github.com/nteract/nteract/releases/tag/v${app.getVersion()}`
        );
      }
    },
    {
      label: "Install Additional Kernels",
      click: () => {
        shell.openExternal("https://nteract.io/kernels");
      }
    }
  ] as any[]
};

if (process.platform !== "darwin") {
  helpDraft.submenu.unshift(shellCommands, { type: "separator" });
}

export const help = helpDraft;

const name = "nteract";
app.setName(name);

export const named = {
  label: name,
  submenu: [
    {
      label: `About ${name}`,
      role: "about"
    },
    {
      type: "separator"
    },
    shellCommands,
    {
      type: "separator"
    },
    {
      label: "Services",
      role: "services",
      submenu: []
    },
    {
      type: "separator"
    },
    {
      label: `Hide ${name}`,
      accelerator: "Command+H",
      role: "hide"
    },
    {
      label: "Hide Others",
      accelerator: "Command+Alt+H",
      role: "hideothers"
    },
    {
      label: "Show All",
      role: "unhide"
    },
    {
      type: "separator"
    },
    {
      label: "Quit",
      accelerator: "Command+Q",
      click: () => app.quit()
    }
  ]
};

export function loadFullMenu(store = global.store) {
  // NOTE for those looking for selectors -- this state is not the same as the
  //      "core" state -- it's a main process side model in the electron app
  const state = store.getState();
  const kernelSpecs = state.get("kernelSpecs") ? state.get("kernelSpecs") : {};

  function generateSubMenu(kernel: KernelspecInfo) {
    return {
      label: kernel.spec.display_name,
      click: createSender("menu:new-kernel", kernel)
    };
  }

  const kernelMenuItems = sortBy(kernelSpecs, "spec.display_name").map(
    generateSubMenu
  );

  const newNotebookItems = sortBy(kernelSpecs, "spec.display_name").map(
    kernel => ({
      label: kernel.spec.display_name,
      click: () => launchNewNotebook(null, kernel)
    })
  );

  // Iterate over the manifest, creating example notebooks for multiple categories

  const examplesBaseDir = path
    .join(__dirname, "..", "node_modules", "@nteract/examples")
    .replace("app.asar", "app.asar.unpacked");

  const openExampleNotebooks = {
    label: "&Open Example Notebook",
    // From the @nteract/examples manifest...
    submenu: manifest.map(collection => {
      return {
        // create a submenu for each language
        label: `&${collection.language}`,
        submenu: collection.files.map(fileInfo => {
          return {
            click: launch.bind(null, path.join(examplesBaseDir, fileInfo.path)),
            label: `&${fileInfo.metadata.title}`
          };
        })
      };
    })
  };

  const fileSubMenus = {
    new: {
      label: "&New",
      accelerator: "CmdOrCtrl+N"
    },
    open: {
      label: "&Open",
      click: () => {
        const opts: {
          title: string;
          filters: FileFilter[];
          properties: ["openFile"];
          defaultPath?: string;
        } = {
          title: "Open a notebook",
          filters: [{ name: "Notebooks", extensions: ["ipynb"] }],
          properties: ["openFile"],
          defaultPath: undefined
        };
        if (process.cwd() === "/") {
          opts.defaultPath = app.getPath("home");
        }

        dialog.showOpenDialog(opts, (fname?: string[]) => {
          if (fname) {
            launch(fname[0]);
            app.addRecentDocument(fname[0]);
          }
        });
      },
      accelerator: "CmdOrCtrl+O"
    },
    openExampleNotebooks,
    save: {
      label: "&Save",
      enabled: BrowserWindow.getAllWindows().length > 0,
      click: createSender("menu:save"),
      accelerator: "CmdOrCtrl+S"
    },
    saveAs: {
      label: "Save &As",
      enabled: BrowserWindow.getAllWindows().length > 0,
      click: (item: object, focusedWindow: BrowserWindow) => {
        const opts: {
          title: string;
          filters: FileFilter[];
          defaultPath?: string;
        } = {
          title: "Save Notebook As",
          filters: [{ name: "Notebooks", extensions: ["ipynb"] }],
          defaultPath: undefined
        };

        if (process.cwd() === "/") {
          opts.defaultPath = app.getPath("home");
        }

        dialog.showSaveDialog(opts, filename => {
          if (!filename) {
            return;
          }

          const ext = path.extname(filename) === "" ? ".ipynb" : "";
          send(focusedWindow, "menu:save-as", `${filename}${ext}`);
        });
      },
      accelerator: "CmdOrCtrl+Shift+S"
    },
    publish: {
      label: "&Publish",
      enabled: BrowserWindow.getAllWindows().length > 0,
      submenu: [
        {
          label: "&Gist",
          enabled: BrowserWindow.getAllWindows().length > 0,
          click: createSender("menu:publish:gist")
        }
      ]
    },
    exportPDF: {
      label: "Export &PDF",
      enabled: BrowserWindow.getAllWindows().length > 0,
      click: createSender("menu:exportPDF")
    }
  };

  const file = {
    label: "&File",
    submenu: [
      fileSubMenus.new,
      fileSubMenus.open,
      fileSubMenus.openExampleNotebooks,
      fileSubMenus.save,
      fileSubMenus.saveAs,
      fileSubMenus.publish,
      fileSubMenus.exportPDF
    ] as any[]
  };

  if (process.platform === "win32") {
    file.submenu.push(
      {
        type: "separator"
      },
      {
        label: "Exit",
        accelerator: "Alt+F4",
        role: "close"
      }
    );
  } else if (process.platform === "darwin") {
    file.submenu.splice(2, 0, {
      label: "Open Recent",
      role: "recentdocuments",
      submenu: [
        {
          label: "Clear Recent",
          role: "clearrecentdocuments"
        }
      ]
    });
  }

  const edit = {
    label: "Edit",
    submenu: [
      {
        label: "Cut",
        accelerator: "CmdOrCtrl+X",
        role: "cut"
      },
      {
        label: "Copy",
        accelerator: "CmdOrCtrl+C",
        role: "copy"
      },
      {
        label: "Paste",
        accelerator: "CmdOrCtrl+V",
        role: "paste"
      },
      {
        label: "Select All",
        accelerator: "CmdOrCtrl+A",
        role: "selectall"
      },
      {
        type: "separator"
      },
      {
        label: "Insert Code Cell Above",
        enabled: BrowserWindow.getAllWindows().length > 0,
        accelerator: "CmdOrCtrl+Shift+A",
        click: createSender("menu:new-code-cell-above")
      },
      {
        label: "Insert Code Cell Below",
        enabled: BrowserWindow.getAllWindows().length > 0,
        accelerator: "CmdOrCtrl+Shift+B",
        click: createSender("menu:new-code-cell-below")
      },
      {
        label: "Insert Text Cell Below",
        enabled: BrowserWindow.getAllWindows().length > 0,
        click: createSender("menu:new-text-cell-below")
      },
      {
        label: "Insert Raw Cell Below",
        enabled: BrowserWindow.getAllWindows().length > 0,
        click: createSender("menu:new-raw-cell-below")
      },
      {
        type: "separator"
      },
      {
        label: "Copy Cell",
        enabled: BrowserWindow.getAllWindows().length > 0,
        accelerator: "CmdOrCtrl+Shift+C",
        click: createSender("menu:copy-cell")
      },
      {
        label: "Cut Cell",
        enabled: BrowserWindow.getAllWindows().length > 0,
        accelerator: "CmdOrCtrl+Shift+X",
        click: createSender("menu:cut-cell")
      },
      {
        label: "Paste Cell",
        enabled: BrowserWindow.getAllWindows().length > 0,
        accelerator: "CmdOrCtrl+Shift+V",
        click: createSender("menu:paste-cell")
      },
      {
        label: "Delete Cell",
        enabled: BrowserWindow.getAllWindows().length > 0,
        accelerator: "CmdOrCtrl+Shift+D",
        click: createSender("menu:delete-cell")
      },
      {
        type: "separator"
      },
      {
        label: "Preferences",
        click: createSender("menu:open-config-window"),
      },
    ]
  };

  const cell = {
    label: "Cell",
    submenu: [
      {
        label: "Change Cell Type to Code",
        enabled: BrowserWindow.getAllWindows().length > 0,
        accelerator: "CmdOrCtrl+Shift+Y",
        click: createSender("menu:change-cell-to-code")
      },
      {
        label: "Change Cell Type to Text",
        enabled: BrowserWindow.getAllWindows().length > 0,
        accelerator: "CmdOrCtrl+Shift+M",
        click: createSender("menu:change-cell-to-text")
      },
      {
        type: "separator"
      },
      {
        label: "Run All",
        enabled: BrowserWindow.getAllWindows().length > 0,
        click: createSender("menu:run-all")
      },
      {
        label: "Run All Below",
        enabled: BrowserWindow.getAllWindows().length > 0,
        click: createSender("menu:run-all-below")
      },
      {
        label: "Clear All Outputs",
        enabled: BrowserWindow.getAllWindows().length > 0,
        click: createSender("menu:clear-all")
      },
      {
        label: "Unhide Input and Output in all Cells",
        enabled: BrowserWindow.getAllWindows().length > 0,
        click: createSender("menu:unhide-all")
      }
    ]
  };

  const view = {
    label: "View",
    submenu: [
      {
        label: "Reload",
        enabled: BrowserWindow.getAllWindows().length > 0,
        accelerator: "CmdOrCtrl+R",
        click: createSender("reload")
      },
      {
        label: "Toggle Full Screen",
        enabled: BrowserWindow.getAllWindows().length > 0,
        accelerator: (() => {
          if (process.platform === "darwin") {
            return "Ctrl+Command+F";
          }
          return "F11";
        })(),
        click: (item: object, focusedWindow: BrowserWindow) => {
          if (focusedWindow) {
            focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
          }
        }
      },
      {
        label: "Toggle Developer Tools",
        enabled: BrowserWindow.getAllWindows().length > 0,
        accelerator: (() => {
          if (process.platform === "darwin") {
            return "Alt+Command+I";
          }
          return "Ctrl+Shift+I";
        })(),
        click: (item: object, focusedWindow: WebContents) => {
          if (focusedWindow) {
            focusedWindow.toggleDevTools();
          }
        }
      },
      {
        label: "Actual Size",
        enabled: BrowserWindow.getAllWindows().length > 0,
        accelerator: "CmdOrCtrl+0",
        click: createSender("menu:zoom-reset")
      },
      {
        label: "Zoom In",
        enabled: BrowserWindow.getAllWindows().length > 0,
        accelerator: "CmdOrCtrl+=",
        click: createSender("menu:zoom-in")
      },
      {
        label: "Zoom Out",
        enabled: BrowserWindow.getAllWindows().length > 0,
        accelerator: "CmdOrCtrl+-",
        click: createSender("menu:zoom-out")
      },
    ]
  };

  const languageMenu = {
    label: "&Runtime",
    submenu: [
      {
        label: "&Kill",
        enabled: BrowserWindow.getAllWindows().length > 0,
        click: createSender("menu:kill-kernel")
      },
      {
        label: "&Interrupt",
        enabled: BrowserWindow.getAllWindows().length > 0,
        click: createSender("menu:interrupt-kernel")
      },
      {
        label: "&Restart",
        enabled: BrowserWindow.getAllWindows().length > 0,
        click: createSender("menu:restart-kernel")
      },
      {
        label: "Restart and &Clear All Cells",
        enabled: BrowserWindow.getAllWindows().length > 0,
        click: createSender("menu:restart-and-clear-all")
      },
      {
        label: "Restart and Run &All Cells",
        enabled: BrowserWindow.getAllWindows().length > 0,
        click: createSender("menu:restart-and-run-all")
      },
      {
        type: "separator"
      },
      // All the available kernels
      ...kernelMenuItems
    ]
  };

  const template = [];

  if (process.platform === "darwin") {
    template.push(named);
  }

  const fileWithNew = {
    label: "&File",
    submenu: [
      {
        label: "&New",
        submenu: newNotebookItems
      },
      fileSubMenus.open,
      fileSubMenus.openExampleNotebooks,
      fileSubMenus.save,
      fileSubMenus.saveAs,
      fileSubMenus.publish,
      fileSubMenus.exportPDF
    ] as any[]
  };

  if (process.platform === "win32") {
    fileWithNew.submenu.push(
      {
        type: "separator"
      },
      {
        label: "Exit",
        accelerator: "Alt+F4",
        role: "close"
      }
    );
  } else if (process.platform === "darwin") {
    fileWithNew.submenu.splice(2, 0, {
      label: "Open Recent",
      role: "recentdocuments",
      submenu: [
        {
          label: "Clear Recent",
          role: "clearrecentdocuments"
        }
      ]
    });
  }

  template.push(fileWithNew);
  template.push(edit);
  template.push(cell);
  template.push(view);

  // Application specific functionality should go before window and help
  template.push(languageMenu);
  template.push(window);
  template.push(help);

  const menu = Menu.buildFromTemplate(template);
  return menu;
}

export function loadTrayMenu(store = global.store) {
  // NOTE for those looking for selectors -- this state is not the same as the
  //      "core" state -- it's a main process side model in the electron app
  const state = store.getState();
  const kernelSpecs = state.get("kernelSpecs") ? state.get("kernelSpecs") : {};

  const newNotebookItems = sortBy(kernelSpecs, "spec.display_name").map(
    kernel => ({
      label: kernel.spec.display_name,
      click: () => launchNewNotebook(null, kernel)
    })
  );

  const open = {
    label: "&Open",
    click: () => {
      const opts: {
        title: string;
        filters: FileFilter[];
        properties: ["openFile"];
        defaultPath?: string;
      } = {
        title: "Open a notebook",
        filters: [{ name: "Notebooks", extensions: ["ipynb"] }],
        properties: ["openFile"],
        defaultPath: undefined
      };
      if (process.cwd() === "/") {
        opts.defaultPath = app.getPath("home");
      }

      dialog.showOpenDialog(opts, (fname?: string[]) => {
        if (fname) {
          launch(fname[0]);
          app.addRecentDocument(fname[0]);
        }
      });
    }
  };

  const template = [];

  const fileWithNew = {
    label: "&New",
    submenu: newNotebookItems
  };

  template.push(fileWithNew);
  template.push(open);

  const menu = Menu.buildFromTemplate(template);
  return menu;
}
