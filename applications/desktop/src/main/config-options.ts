import { createConfigOption } from "@nteract/mythic-configuration";

export const {
  selector: defaultKernel,
  action: setDefaultKernel,
} = createConfigOption({
  key: "defaultKernel",
  label: "Default kernel on startup",
  valuesFrom: "kernelspecs",
}, "python3");
