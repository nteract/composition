# fs-observable

This package contains RxJS Observables for Node's `fs` module API.

## Installation

```
$ yarn add fs-observable
```

```
$ npm install --save fs-observable
```

## Usage

The example below shows how we can use the observables within this package to read in a file.

```javascript
import { readFileObservable } from "fs-observable";

export default () => {
  return readFileObservable("./notebook.ipynb").pipe(
    catchError(err => {
      if (err.code === "ENOENT") {
        return false;
      }
      throw err;
    })
  );
};
```

## Documentation

We're working on adding more documentation for this component. Stay tuned by watching this repository!

## Support

If you experience an issue while using this package or have a feature request, please file an issue on the [issue board](https://github.com/nteract/nteract/issues/new/choose) and add the `pkg:fs-observable` label.

## License

[BSD-3-Clause](https://choosealicense.com/licenses/bsd-3-clause/)
