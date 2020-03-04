import { app } from "electron";
import { appName } from "./appname";
import * as commands from "./commands";

export const menu = [
  [appName, { platform: "darwin" }, [
    [`About ${appName}`, commands.About],
    [],
    ["Install Shell Command", commands.InstallShellCommand],
    [],
    ["Services", { role: "services" }, [
      // filled by the system based on role
    ]],
    [],
    { Hide: `Hide ${appName}` },
    { HideOthers: "Hide Others" },
    { Unhide: "Show All" },
    [],
    { Quit: "Quit" },
  ]],
  ["&File", [
    ["&New", [
      ["{name}", commands.NewNotebook, { forEach: "kernelspec" }],
    ]],
    ["&Open", commands.Open],
    ["Open Recent", { role: "recentdocuments", platform: "darwin" }, [
      ["Clear Recent", commands.ClearRecentDocuments],
      // documents added by the system based on role
    ]],
    ["Open E&xample Notebook", [
      ["{language}->{name}", commands.Open, { forEach: "example-notebook" }],
    ]],
    ["&Save", commands.Save],
    ["Save &As", commands.SaveAs],
    ["&Publish", [
      ["&Gist", commands.PublishGist],
    ]],
    ["Ex&port", [
      ["&PDF", commands.ExportPDF],
    ]],
    [],
    ["Exit", commands.Close, { platform: "win32" }],
  ]],
  {
    "Edit": [
      { Cut: "Cut" },
      { Copy: "Copy" },
      { Paste: "Paste" },
      { SelectAll: "Select All" },
      {},
      { NewCodeCellAbove: "Insert Code Cell Above" },
      { NewCodeCellBelow: "Insert Code Cell Below" },
      { NewTextCellBelow: "Insert Text Cell Below" },
      { NewRawCellBelow: "Insert Raw Cell Below" },
      {},
      { CopyCell: "Copy Cell" },
      { CutCell: "Cut Cell" },
      { PasteCell: "Paste Cell" },
      { DeleteCell: "Delete Cell" },
    ],
  },
  {
    "Cell": [
      { ChangeCellToCode: "Change Cell Type to Code" },
      { ChangeCellToText: "Change Cell Type to Text" },
      {},
      { RunAll: "Run All" },
      { RunAllBelow: "Run All Below" },
      { ClearAll: "Clear All Outputs" },
      { UnhideAll: "Unhide Input and Output in all Cells" },
    ],
  },
  {
    "View": [
      { Reload: "Reload" },
      { FullScreen: "Toggle Full Screen" },
      { DevTools: "Toggle Developer Tools" },
      {},
      { ZoomReset: "Actual Size" },
      { ZoomIn: "Zoom In" },
      { ZoomOut: "Zoom Out" },
    ],
  },
  {
    "&Runtime": [
      { KillKernel: "&Kill" },
      { InterruptKernel: "&Interrupt" },
      { RestartKernel: "&Restart" },
      { RestartAndClearAll: "Restart and &Clear All Cells" },
      { RestartAndRunAll: "Restart and Run &All Cells" },
      {},
      { "https://nteract.io/kernels": "&Install Runtimes" },
      {},
      { NewKernel: { forEach: "kernelspec" } },
    ],
  },
  {
    "Window": [
      { Minimize: "Minimize" },
      { Close: "Close" },
      {},
      { BringAllToFront: "Bring All to Front", platform: "darwin" },
    ],
    role: "window",
  },
  {
    "Help": [
      { "https://docs.nteract.io":
          "Documentation" },

      { "https://docs.nteract.io/#/desktop/shortcut-keys":
          "Keyboard Shortcuts" },

      { "https://github.com/nteract/nteract":
          "View nteract on GitHub" },

      // tslint:disable-next-line:max-line-length
      { [`https://github.com/nteract/nteract/releases/tag/v${app.getVersion()}`]:
          `Release Notes (${app.getVersion()})` },

      { "https://nteract.io/kernels":
          "Install Additional Kernels" },

      {},

      {
        InstallShellCommand: "Install Shell Command",
        platfom: "!darwin",
      },
    ],
    role: "help",
  },
];
