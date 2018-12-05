# @nteract/octicons

This package contains a set of React icon components used within nteract applications. These icons are based on the [GitHub Octicons icon set](https://octicons.github.com/).

## Installation

```
$ yarn add @nteract/octicons
```

```
$ npm install --save @nteract/octicons
```

## Usage

The example below shows how to use the icons in this package to render a save button.

```javascript
import { DownArrow } from "@nteract/actions";

export default () => {
  return (
    <button>
      <DownArrow /> Save
    </button>
  );
};
```

## Documentation

We're working on adding more documentation for this component. Stay tuned by watching this repository!

## Support

If you experience an issue while using this package or have a feature request, please file an issue on the [issue board](https://github.com/nteract/nteract/issues/new/choose) and add the `pkg:octicons` label.

## License

[BSD-3-Clause](https://choosealicense.com/licenses/bsd-3-clause/)
