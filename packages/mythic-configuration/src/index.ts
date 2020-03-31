import { Store } from "redux";
import { setConfigAtKey } from "./myths/set-config-at-key";
import { configuration } from "./package";
import { ConfigurationOption, HasPrivateConfigurationState } from "./types";

export { setConfigFile } from "./backends/filesystem"
export { configuration } from "./package";
export { setConfigAtKey } from "./myths/set-config-at-key"
export * from "./types";

const options: {[key: string]: ConfigurationOption} = {};

export const createConfigOption = <TYPE>(
  props: ConfigurationOption<TYPE>,
  defaultValue: TYPE,
  transfer: boolean = false,
) => {
  if (!transfer && props.key in options) {
    throw new Error(`Duplicate configuration option "${props.key}"`);
  }

  options[props.key] = props;

  return {
    selector: configuration.createSelector(
      state => state.current.get(props.key, defaultValue),
    ),
    action: (value: TYPE) => setConfigAtKey.create({ key: props.key, value }),
  };
};

export const allConfigOptions = (state?: HasPrivateConfigurationState) => {
  const all = Object.values(options);

  if (state !== undefined) {
    console.log(state.__private__.configuration.current);
    return all.map(x => ({...x, value: state.__private__.configuration.current.get(x.key)}))
  }
  else {
    return all;
  }
}
