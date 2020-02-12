import { createConfigOption } from "./create-option";

export { loadConfig } from "./myths/load-config"
export { configuration } from "./package";
export { createConfigOption } from "./create-option";
export * from "./types";

export const {
  selector: theme,
  action: setTheme,
} = createConfigOption("theme")("light");
