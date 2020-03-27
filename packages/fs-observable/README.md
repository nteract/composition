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

## Support

If you experience an issue while using this package or have a feature request, please file an issue on the [issue board](https://github.com/nteract/fs-observable/issues).

## License

[BSD-3-Clause](https://choosealicense.com/licenses/bsd-3-clause/)
