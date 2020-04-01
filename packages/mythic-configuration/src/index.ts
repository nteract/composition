import { setConfigAtKey } from "./myths/set-config-at-key";
import { configuration } from "./package";
import { ConfigurationOption, ConfigurationOptionDefinition, HasPrivateConfigurationState } from "./types";

export { setConfigFile } from "./backends/filesystem"
export { configuration } from "./package";
export { setConfigAtKey } from "./myths/set-config-at-key"
export * from "./types";

const options: {[key: string]: ConfigurationOption} = {};

const defineConfigOption = <TYPE>(
  props: ConfigurationOptionDefinition<TYPE>,
  allowDuplicate: boolean,
) => {
  if (!allowDuplicate && props.key in options) {
    throw new Error(`Duplicate configuration option "${props.key}"`);
  }

  options[props.key] = {
    ...props,
    value: props.defaultValue,
    selector: configuration.createSelector(
      state => state.current.get(props.key, props.defaultValue),
    ),
    action: (value: TYPE) => setConfigAtKey.create({ key: props.key, value }),
  };

  return options[props.key];
};

export const createConfigOption = <TYPE>(
  props: ConfigurationOptionDefinition<TYPE>,
) => defineConfigOption(props, false);

export const transferConfigOptionFromRenderer = <TYPE>(
  props: ConfigurationOptionDefinition<TYPE>,
) => defineConfigOption(props, true);

export const allConfigOptions = (state?: HasPrivateConfigurationState) => {
  const all = Object.values(options);

  if (state !== undefined) {
    return all.map(x => ({
      ...x,
      value: state.__private__.configuration.current.get(x.key),
    }));
  }
  else {
    return all;
  }
};
