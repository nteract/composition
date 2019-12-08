# @nteract/stateful-components Overview

The @nteract/stateful-components package exports a set of React components that are connected to the Redux and an unconnected set of components.

## Using stateful-components with the nteract core SDK

If you're building a notebook-based application using the nteract core SDK, you can use the connected components to render different components within a notebook, such as Cells and Outputs using the data that is stored in the Redux store.

These connected components are designed to work with the Redux state model that the nteract core SDK uses. In short, it expects that certain properties are stored in particular locations within the Redux subtree.

To use the connected components, you can import each of the components from the `@nteract/stateful-components` package as needed.

```
import { CodeCell } from "@nteract/stateful-components";

class MyApp extends React.Component {
    render() {
        return <CodeCell contentRef={contentRef} id={cellId}>;
    }
}
```

As you can see from the example above, the connected `CodeCell` component expects to receive a `contentRef` and an `id`. The `conntetRef` is a unique ID that is used to refer to the model of a particular notebook in the nteract core Redux state. The `id` is the cell ID that references the cell as it is stored in the nteract core Redux state.

All the connected components expect either a `contentRef` or a `id`. These two pieces of information are used to resolve the correct data from the Redux state and pass it to the component.
