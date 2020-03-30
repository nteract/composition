import * as path from "path";
import { appName } from "./appname";
import * as commands from "./commands";
import { MenuDefinition } from "./commands/types";

const examplesBaseDir = path
  .join(__dirname, "..", "node_modules", "@nteract/examples")
  .replace("app.asar", "app.asar.unpacked");

export const tray: MenuDefinition = [
  ["&New", [
    {
      forEach: "kernelspec",
      create: spec =>
        [spec.name, commands.LaunchNewNotebook, { props: { kernelSpec: spec }}],
    },
  ]],
  ["&Open", commands.Open],
];

export const menu: MenuDefinition = [
  [appName, { platform: "darwin" }, [
    [`About ${appName}`, commands.About],
    [],
    ["Install Shell Command", commands.InstallShellCommand],
    [],
    ["Services", { role: "services" }, [
      // filled by the system based on the above role
    ]],
    [],
    [`Hide ${appName}`, commands.Hide],
    ["Hide Others", commands.HideOthers],
    ["Show All", commands.Unhide],
    [],
    ["Quit", commands.Quit],
  ]],
  ["&File", [
    ["&New", [
      {
        forEach: "kernelspec",
        create: spec =>
          [spec.name, commands.LaunchNewNotebook, {props: {kernelSpec: spec}}],
      },
    ]],
    ["&Open", commands.Open],      // v-- Listed in electron docs, but not types
    ["Open Recent", { role: "recentDocuments" as any, platform: "darwin" }, [
      ["Clear Recent", commands.ClearRecentDocuments],
      // documents added by the system based on the above role
    ]],
    ["Open E&xample Notebook", [
      {
        forEach: "example",
        create: item =>
          [item.language, item.files.map(file =>
            [file.metadata.title,
              commands.Launch, { props: {
                filepath: path.join(examplesBaseDir, file.path),
              } }]
          )],
      },
    ]],
    ["&Save", commands.Save],
    ["Save &As", commands.SaveAs],
    [],
    ["&Publish", [
      ["&Gist", commands.PublishGist],
    ]],
    ["Ex&port", [
      ["&PDF", commands.ExportPDF],
    ]],
    [],
    ["Exit", commands.Close, { platform: "win32" }],
  ]],
  ["Edit", [
    ["Cut", commands.Cut],
    ["Copy", commands.Copy],
    ["Paste", commands.Paste],
    ["Select All", commands.SelectAll],
    [],
    ["Insert Code Cell Above", commands.NewCodeCellAbove],
    ["Insert Code Cell Below", commands.NewCodeCellBelow],
    ["Insert Text Cell Below", commands.NewTextCellBelow],
    ["Insert Raw Cell Below", commands.NewRawCellBelow],
    [],
    ["Copy Cell", commands.CopyCell],
    ["Cut Cell", commands.CutCell],
    ["Paste Cell", commands.PasteCell],
    ["Delete Cell", commands.DeleteCell],
  ]],
  ["Cell", [
    ["Change Cell Type to Code", commands.ChangeCellToCode],
    ["Change Cell Type to Text", commands.ChangeCellToText],
    [],
    ["Run All", commands.RunAll],
    ["Run All Below", commands.RunAllBelow],
    ["Clear All Outputs", commands.ClearAll],
    ["Unhide Input and Output in all Cells", commands.UnhideAll],
  ]],
  ["View", [
    ["Reload", commands.Reload],
    ["Toggle Full Screen", commands.Fullscreen],
    ["Toggle Developer Tools", commands.DevTools],
    [],
    ["Actual Size", commands.ZoomReset],
    ["Zoom In", commands.ZoomIn],
    ["Zoom Out", commands.ZoomOut],
  ]],
  ["&Runtime", [
    ["&Kill", commands.KillKernel],
    ["&Interrupt", commands.InterruptKernel],
    ["&Restart", commands.RestartKernel],
    ["Restart and &Clear All Cells", commands.RestartAndClearAll],
    ["Restart and Run &All Cells", commands.RestartAndRunAll],
    [],
    ["&Install Runtimes", "https://nteract.io/kernels"],
    [],
    {
      forEach: "kernelspec",
      create: spec =>
        [spec.name, commands.NewKernel, { props: { kernelSpec: spec } }],
    },
  ]],
  ["Preferences", [
    {
      forEach: "preference",
      create: item =>
        [item.label, (item.values ?? []).map(value => [
          value.label,
          commands.SetPreference,
          { props: { key: item.key, value: value.value } },
        ])],
    },
  ]],
  ["Window", { role: "window" }, [
    ["Minimize", commands.Minimize],
    ["Close", commands.Close],
    [],
    ["Bring All to Front", commands.BringAllToFront, { platform: "darwin" }],
  ]],
  ["Help", { role: "help" }, [
    ["Documentation", "https://docs.nteract.io"],
    ["Keyboard Shortcuts", "https://docs.nteract.io/#/desktop/shortcut-keys"],
    ["View nteract on GitHub", "https://github.com/nteract/nteract"],
    ["Release Notes (<<version>>)", "https://github.com/nteract/nteract/releases/tag/v<<version>>"],
    ["Install Additional Kernels", "https://nteract.io/kernels"],
    [],
    ["Install Shell Command", commands.InstallShellCommand, { platform: "!darwin" }],
  ]],
];
