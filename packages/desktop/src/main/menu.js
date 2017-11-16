import {
  dialog,
  app,
  shell,
  Menu,
  ipcMain as ipc,
  BrowserWindow
} from "electron";
import * as path from "path";
import { launch, launchNewNotebook } from "./launch";
import { installShellCommand } from "./cli";

function getExampleNotebooksDir() {
  if (process.env.NODE_ENV === "development") {
    return path.resolve(path.join(__dirname, "..", "example-notebooks"));
  }
  return path.join(process.resourcesPath, "example-notebooks");
}

const exampleNotebooksDirectory = getExampleNotebooksDir();

function send(focusedWindow, eventName, obj) {
  if (!focusedWindow) {
    console.error("renderer window not in focus (are your devtools open?)");
    return;
  }
  focusedWindow.webContents.send(eventName, obj);
}

function createSender(eventName, obj) {
  return (item, focusedWindow) => {
    send(focusedWindow, eventName, obj);
  };
}

export function authAndPublish(item, focusedWindow) {
  const win = new BrowserWindow({
    show: false,
    webPreferences: { zoomFactor: 0.75 }
  });
  if (process.env.AUTHENTICATED) {
    send(focusedWindow, "menu:github:auth");
    return;
  }
  win.webContents.on("dom-ready", () => {
    if (win.getURL().indexOf("callback?code=") !== -1) {
      win.webContents.executeJavaScript(
        `
        require('electron').ipcRenderer.send('auth', document.body.textContent);
        `
      );
      ipc.on("auth", (event, auth) => {
        send(focusedWindow, "menu:github:auth", JSON.parse(auth).access_token);
        process.env.AUTHENTICATED = true;
        win.close();
      });
    } else {
      win.show();
    }
  });
  win.loadURL("https://oauth.nteract.io/github");
}

const theme_menu = [
  {
    label: "Light",
    click: createSender("menu:theme", "light")
  },
  {
    label: "Dark",
    click: createSender("menu:theme", "dark")
  },
  {
    label: "Classic",
    click: createSender("menu:theme", "classic")
  },
  {
    label: "nteract",
    click: createSender("menu:theme", "nteract")
  },
  {
    label: "One-Dark",
    click: createSender("menu:theme", "one-dark")
  }
];
const blink_menu = [
  // TODO: replace the with one `type: 'checkbox'` item once we have state to
  // know which way it should be set initially.
  {
    label: "Do Not Blink Editor Cursor",
    click: createSender("menu:set-blink-rate", 0)
  },
  {
    label: "Blink Editor Cursor",
    click: createSender("menu:set-blink-rate", 530)
  }
];

const today = new Date();
const month = today.getMonth() + 1;
if (month === 12) {
  theme_menu.push({
    label: "Hohoho",
    click: createSender("menu:theme", "christmas")
  });
} else if (month === 10) {
  theme_menu.push({
    label: "Pumpkin Spice",
    click: createSender("menu:theme", "halloween")
  });
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
  ]
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
      label: "Learn More",
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
        shell.openExternal(
          "https://ipython.readthedocs.io/en/latest/install/kernel_install.html"
        );
      }
    }
  ]
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
  const state = store.getState();
  const kernelSpecs = state.get("kernelSpecs") ? state.get("kernelSpecs") : {};

  function generateSubMenu(kernelSpecName) {
    return {
      label: kernelSpecs[kernelSpecName].spec.display_name,
      click: createSender("menu:new-kernel", kernelSpecs[kernelSpecName])
    };
  }

  const kernelMenuItems = Object.keys(kernelSpecs).map(generateSubMenu);

  const newNotebookItems = Object.keys(kernelSpecs).map(kernelSpecName => ({
    label: kernelSpecs[kernelSpecName].spec.display_name,
    click: () => launchNewNotebook(kernelSpecs[kernelSpecName])
  }));

  const fileSubMenus = {
    new: {
      label: "&New",
      accelerator: "CmdOrCtrl+N"
    },
    open: {
      label: "&Open",
      click: () => {
        const opts = {
          title: "Open a notebook",
          filters: [{ name: "Notebooks", extensions: ["ipynb"] }],
          properties: ["openFile"]
        };
        if (process.cwd() === "/") {
          opts.defaultPath = app.getPath("home");
        }

        dialog.showOpenDialog(opts, fname => {
          if (fname) {
            launch(fname[0]);
          }
        });
      },
      accelerator: "CmdOrCtrl+O"
    },
    openExampleNotebooks: {
      label: "&Open Example Notebook",
      submenu: [
        {
          label: "&Intro",
          click: launch.bind(
            null,
            path.join(exampleNotebooksDirectory, "intro.ipynb")
          )
        },
        {
          label: "&Plotly",
          click: launch.bind(
            null,
            path.join(exampleNotebooksDirectory, "plotly.ipynb")
          )
        },
        {
          label: "&Plotly (R)",
          click: launch.bind(
            null,
            path.join(exampleNotebooksDirectory, "plotlyr.ipynb")
          )
        },
        {
          label: "&Vegalite (Python)",
          click: launch.bind(
            null,
            path.join(exampleNotebooksDirectory, "altair.ipynb")
          )
        },
        {
          label: "&Vegalite (R)",
          click: launch.bind(
            null,
            path.join(exampleNotebooksDirectory, "vegalite-for-r.ipynb")
          )
        },
        {
          label: "&Geojson",
          click: launch.bind(
            null,
            path.join(exampleNotebooksDirectory, "geojson.ipynb")
          )
        },
        {
          label: "&Pandas to GeoJSON",
          click: launch.bind(
            null,
            path.join(exampleNotebooksDirectory, "pandas-to-geojson.ipynb")
          )
        },
        {
          label: "&Named display updates",
          click: launch.bind(
            null,
            path.join(exampleNotebooksDirectory, "display-updates.ipynb")
          )
        },
        {
          label: "VDOMmable updates with emojis",
          click: launch.bind(
            null,
            path.join(exampleNotebooksDirectory, "vdom.ipynb")
          )
        },
        {
          label: "&Analyze nteract download metrics",
          click: launch.bind(
            null,
            path.join(exampleNotebooksDirectory, "download-stats.ipynb")
          )
        },
        {
          label: "&Exploring Custom Revival with JSON.parse",
          click: launch.bind(
            null,
            path.join(exampleNotebooksDirectory, "immutable-revival.ipynb")
          )
        }
      ]
    },
    save: {
      label: "&Save",
      enabled: BrowserWindow.getAllWindows().length > 0,
      click: createSender("menu:save"),
      accelerator: "CmdOrCtrl+S"
    },
    saveAs: {
      label: "Save &As",
      enabled: BrowserWindow.getAllWindows().length > 0,
      click: (item, focusedWindow) => {
        const opts = {
          title: "Save Notebook As",
          filters: [{ name: "Notebooks", extensions: ["ipynb"] }]
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
          label: "&User Gist",
          enabled: BrowserWindow.getAllWindows().length > 0,
          click: authAndPublish
        },
        {
          label: "&Anonymous Gist",
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
    ]
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
        label: "New Code Cell",
        enabled: BrowserWindow.getAllWindows().length > 0,
        accelerator: "CmdOrCtrl+Shift+N",
        click: createSender("menu:new-code-cell")
      },
      {
        label: "New Text Cell",
        enabled: BrowserWindow.getAllWindows().length > 0,
        accelerator: "CmdOrCtrl+Shift+M",
        click: createSender("menu:new-text-cell")
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
      }
    ]
  };

  const cell = {
    label: "Cell",
    submenu: [
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
        label: "Unhide All Outputs",
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
        click: (item, focusedWindow) => {
          if (focusedWindow) {
            focusedWindow.reload();
          }
        }
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
        click: (item, focusedWindow) => {
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
        click: (item, focusedWindow) => {
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
      {
        label: "Theme",
        submenu: theme_menu
      },

      {
        label: "Editor options",
        submenu: blink_menu
      }
    ]
  };

  const languageMenu = {
    label: "&Language",
    submenu: [
      {
        label: "&Kill Running Kernel",
        enabled: BrowserWindow.getAllWindows().length > 0,
        click: createSender("menu:kill-kernel")
      },
      {
        label: "&Interrupt Running Kernel",
        enabled: BrowserWindow.getAllWindows().length > 0,
        click: createSender("menu:interrupt-kernel")
      },
      {
        label: "Restart Running Kernel",
        enabled: BrowserWindow.getAllWindows().length > 0,
        click: createSender("menu:restart-kernel")
      },
      {
        label: "Restart and Clear All Cells",
        enabled: BrowserWindow.getAllWindows().length > 0,
        click: createSender("menu:restart-and-clear-all")
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
    ]
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
