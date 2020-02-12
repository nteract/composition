import { createConfigOption } from "@nteract/mythic-configuration";

export const {
  selector: defaultKernel,
  action: setDefaultKernel,
} = createConfigOption("defaultKernel")("python3");
