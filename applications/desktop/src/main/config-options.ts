import { createConfigOption } from "@nteract/mythic-configuration";

export const {
  selector: defaultKernel,
} = createConfigOption({
  key: "defaultKernel",
  label: "Default kernel on startup",
  valuesFrom: "kernelspecs",
  defaultValue: "python3",
});

export const {
  selector: customAccelerators,
} = createConfigOption({
  key: "accelerators",
  label: "Custom accelerators",
  defaultValue: {},
});
