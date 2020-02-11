import { configuration } from "./package";

export const createConfigOption =
  <NAME extends string>(name: NAME) =>
    <TYPE>(defaultValue: TYPE) =>
      configuration.createSelector(
        (state): string => state.current[name] || defaultValue
      );

export const theme            = createConfigOption("theme")           ("light");
export const editorType       = createConfigOption("editorType") ("codemirror");
export const autoSaveInterval = createConfigOption("autoSaveInterval")(120_000);
export const deleteDelay      = createConfigOption("deleteDelay")      (10_000);
