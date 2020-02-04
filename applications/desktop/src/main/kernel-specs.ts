import { join } from "path";

import { IpcMainEvent, ipcMain as ipc } from "electron";

import { KernelspecInfo, Kernelspecs } from "@nteract/types";

const builtInNodeArgv: string[] = [
  process.execPath,
  join(__dirname, "..", "node_modules", "ijavascript", "lib", "kernel.js"),
  "{connection_file}",
  "--protocol=5.0",
  "--hide-undefined"
];

const KERNEL_SPECS: Kernelspecs = {
  node_nteract: {
    name: "node_nteract",
    spec: {
      argv: builtInNodeArgv,
      display_name: "Node.js (nteract)",
      language: "javascript",
      env: {
        ELECTRON_RUN_AS_NODE: "1",
        NODE_PATH: join(__dirname, "..", "node_modules")
      }
    }
  }
};

export default function initializeKernelSpecs(
  kernelSpecs: Kernelspecs
): Kernelspecs {
  Object.assign(KERNEL_SPECS, kernelSpecs);
  return KERNEL_SPECS;
}

ipc.on("kernel_specs_request", (event: IpcMainEvent) => {
  event.reply("kernel_specs_reply", KERNEL_SPECS);
});
