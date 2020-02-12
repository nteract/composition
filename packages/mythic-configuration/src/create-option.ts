import { setConfigAtKey } from "./myths/set-config-at-key";
import { configuration } from "./package";

export const createConfigOption =
  <NAME extends string>(name: NAME) =>
    <TYPE>(defaultValue: TYPE) => ({
      selector: configuration.createSelector(
        state => state.current[name] || defaultValue,
      ),
      action: (value: TYPE) => setConfigAtKey.create({
        key: name,
        value,
      }),
    });
