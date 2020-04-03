# @nteract/mythic-configuration

This package implements a configuration system.

## Installation

```
$ yarn add @nteract/mythic-configuration
```

```
$ npm install --save @nteract/mythic-configuration
```

## Usage

Initialize the package by including the `configuration` package and dispatching a `setConfigFile` action:

```javascript
import { configuration } from "@nteract/mythic-configuration";
import { makeConfigureStore } from "@nteract/myths";

export const configureStore = makeConfigureStore({
  packages: [configuration],
});

store.dispatch(setConfigFile("/etc/app.conf"));
```

The package will use that file to save any configuration options. The file is also watched and loaded when it changes.

After this initialisation, you can then work with configuration options:

```javascript
export const {
  selector: defaultKernel,
  action: setDefaultKernel,
} = createConfigOption({
  key: "defaultKernel",
  label: "Default kernel on startup",
  valuesFrom: "kernelspecs",
  defaultValue: "python3",
});

const currentValue = defaultKernel(store.getState());

store.dispatch(setDefaultKernel("node_nteract"));
```

You can also get all options:
```javascript
import { allConfigOptions } from "@nteract/mythic-configuration";

const options = allConfigOptions();
const optionsWithCurrentValues = allConfigOptions(store.getState());
```

## API

```typescript
import { RootState } from "@nteract/myths";
import { ConfigurationState, setConfigAtKey } from "@nteract/mythic-configuration";

export interface ConfigurationOptionDefinition<TYPE = any> {
  label: string;
  key: string;
  defaultValue: TYPE;
  valuesFrom?: string;
  values?: Array<{
    label: string;
    value: TYPE;
  }>;
}

export interface ConfigurationOption<TYPE = any>
  extends ConfigurationOptionDefinition<TYPE> {

  value?: TYPE;
  selector: (state: HasPrivateConfigurationState) => TYPE;
  action: (value: TYPE) => typeof setConfigAtKey.action;
}

export type HasPrivateConfigurationState =
  RootState<"configuration", ConfigurationState>;
```

## Support

If you experience an issue while using this package or have a feature request, please file an issue on the [issue board](https://github.com/nteract/nteract/issues/new/choose) and add the `pkg:mythic-configuration` label.

## License

[BSD-3-Clause](https://choosealicense.com/licenses/bsd-3-clause/)
