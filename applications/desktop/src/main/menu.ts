import { manifest as examplesManifest } from "@nteract/examples";
import { KernelspecInfo } from "@nteract/types";
import { app, BrowserWindow, dialog, FileFilter, globalShortcut, Menu } from "electron";
import sortBy from "lodash.sortby";
import * as path from "path";
import { appName } from "../common/appname";
import { installShellCommand } from "./cli";
import { launch, launchNewNotebook } from "./launch";

type Sender = (item: object, focusedWindow: BrowserWindow | null) => void;

const createSender = (
  eventName: string,
  obj?: object | string | number
): Sender =>
  (item: object, focusedWindow: BrowserWindow | null) => {
    if (focusedWindow) {
      focusedWindow.webContents.send(eventName, obj);
    }
  };



// Pasting cells will also paste text, so we need to intercept the event with
// a global shortcut and then only trigger the IPC call.
function interceptAcceleratorAndForceOnlyMenuAction(
  command: string,
): void {
  globalShortcut.register((accelerators as any)[command], () => {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    createSender(`command:${command}`)({}, focusedWindow);
  });
}

interceptAcceleratorAndForceOnlyMenuAction("PasteCell");


app.setName(appName);

export function loadFullMenu(store = global.store) {
  // NOTE for those looking for selectors -- this state is not the same as the
  //      "core" state -- it's a main process side model in the electron app
  const state = store.getState();
  const kernelSpecs = state.get("kernelSpecs") ? state.get("kernelSpecs") : {};
  sortBy(kernelSpecs, "spec.display_name").map(
    kernel => ({
      label: kernel.spec.display_name,
      click: () => launchNewNotebook(null, kernel)
    })
  ),
    submenu: examplesManifest.map(collection => ({
    label: `&${collection.language}`,
    submenu: collection.files.map(fileInfo => ({
      click: () => launch(path.join(examplesBaseDir, fileInfo.path)),
      needsWindow: false,
      label: `&${fileInfo.metadata.title}`
    })),
  })),
  const doOpen = () => {
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
  };
  const doSaveAs = (item: object, focusedWindow: BrowserWindow) => {
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
      send(focusedWindow, "save-as", `${filename}${ext}`);
    });
  };
  const examplesBaseDir = path
    .join(__dirname, "..", "node_modules", "@nteract/examples")
    .replace("app.asar", "app.asar.unpacked");


  return Menu.buildFromTemplate(template);
}

export function loadTrayMenu(store = global.store): Menu {
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

  return Menu.buildFromTemplate(template);
}
