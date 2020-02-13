import { createConfigOption } from "./create-option";

export { setConfigFile } from "./backends/filesystem"
export { configuration } from "./package";
export { createConfigOption } from "./create-option";
export * from "./types";

export const {
  selector: theme,
  action: setTheme,
} = createConfigOption("theme")("light");
