# @nteract/commutable

Commutable is a package to represent a Jupyter notebook document, as well as
operations on the notebook, as a series of immutable notebooks, each one with
its own state at a point in time.

This package follows the principles below, based on
[Tom MacWright](http://www.macwright.org/2015/05/18/practical-undo.html)'s
outline for practical undo.

- **A notebook document is immutable**. The notebook document's representation
  is never mutated in-place.
- Changes to a notebook document are encapsulated into **operations** that
  take a previous version and return a new version of the notebook without
  modifying the old version.
- History is represented as a **list of states**, with _the past_ on one end, _the
  present_ on the other, and _an index_ that can back up into 'undo states'.
- Modifying a notebook document causes any **future states to be thrown away**.

## Installation

```
$ yarn add @nteract/commutable
```

```
$ npm install --save @nteract/commutable
```

## Usage

The example below shows how we can create an empty Markdown cell in our
nteract notebook application. We use the `emptyMarkdownCell` immutable object
exported from this package to represent a new empty Markdown cell in a
notebook document.

```javascript
import { emptyMarkdownCell } from "@nteract/commutable";

export default () => (
  <MarkdownPreview
    id="a-random-cell-id"
    cell={emptyMarkdownCell}
    editorFocused={false}
  />
);
```

## Documentation

You can view the reference documentation for `@nteract/commutable` in the
[package docs](https://packages.nteract.io/modules/commutable.html).

## Support

If you experience an issue while using this package or have a feature request,
please file an issue on the [issue board](https://github.com/nteract/nteract/issues/new/choose)
and, if possible, add the `pkg:commutable` label.

## License

[BSD-3-Clause](https://choosealicense.com/licenses/bsd-3-clause/)
