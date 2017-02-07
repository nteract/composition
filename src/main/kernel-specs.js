import { ipcMain as ipc } from "electron";
import { join } from "path";

const KERNEL_SPECS = {
  node_nteract: {
    name: "node_nteract",
    spec: {
      argv: [
        process.execPath,
        join(require.resolve("ijavascript"), "..", "lib", "kernel.js"),
        "{connection_file}",
        "--protocol=5.0",
        "--hide-undefined"
      ],
      display_name: "Node.js (nteract)",
      language: "javascript",
      env: {
        ELECTRON_RUN_AS_NODE: "1"
      }
    }
  }
};

export default function initializeKernelSpecs(kernelSpecs) {
  Object.assign(KERNEL_SPECS, kernelSpecs);
  return KERNEL_SPECS;
}

ipc.on("kernel_specs_request", event => {
  event.sender.send("kernel_specs_reply", KERNEL_SPECS);
});
