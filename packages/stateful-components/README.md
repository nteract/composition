# @nteract/stateful-components

This package exports a set of React components that are pre-connected to the Redux state as mapped by @nteract/core. This package is designed to reduced the hassle for building React-based applications for developers who are already building on top of the core SDK. It also exposes several interfaces for extending the `mapStateToProps`, `mapDispatchToProps`, and styles of the individual components.

## Installation

```
$ yarn add @nteract/stateful-components
```

```
$ npm install --save @nteract/stateful-components
```

## Usage

You can import the top-leval Notebook component which contains the canonical setup for a Jupyter-backed notebook application.

```
import { Notebook }  from "@nteract/stateful-components"

class MyNotebook extends React.Component {
    render() {
        return <Notebook contentRef={someContentRefHere}>
    }
}
```

Alternatively, you can assemble your own notebook-UI from the subcomponents. For example, to swap out the canonical `MarkdownCell` implementation.

```
import { Cells, Cell, CodeCell, RawCell } from "@nteract/stateful-components";

class MyMarkdownCell extends React.Component {
    static defaultProps = {
        cell_type: "markdown"
    }

    render() {
        return <p>My custom logic here</p>;
    }
}

class MyNotebook extends React.Component {
    render() {
        return <Cells>
            <Cell>
                <MyMarkdownCell/>
                <CodeCell/>
                <RawCell>
            </Cell>
        </Cells>;
    }
}
```

## Documentation

We're working on adding more documentation for this component. Stay tuned by watching this repository!

## Support

If you experience an issue while using this package or have a feature request, please file an issue on the [issue board](https://github.com/nteract/nteract/issues/new/choose) and add the `pkg:stateful-components` label.

## License

[BSD-3-Clause](https://choosealicense.com/licenses/bsd-3-clause/)
