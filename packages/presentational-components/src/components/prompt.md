The `Prompt` component is typically a child of the `Input` component and serves two purposes.
First, it serves as a visual indicator of input entry for end users. Secondly, it allows us to display relevant information about the state of a cell to the end user.

```jsx static
import { Prompt } from "@nteract/presentational-components"
```

A `<Prompt/>` component with no props will render an empty set of brackets.

```
<Prompt />
```

You can use the `counter` prop to pass a number that will be rendered within the brackets. If you're working in the Jupyter ecosystem, this number will likely be the `execution_count` returned by the Jupyter kernel. This `execution_count` indicates the ordinal position in which the current cell was executed.

```js
<Prompt counter={12} />
```

You can use the `running` prop to indicate that an execution is underway for the current cell. This will render an asterisk ("*") in between the brackets to indicate the in-progress execution to the user.

```js
<Prompt counter={12} running />
```

You can use the `queued` prop to indicate that a cell is queued for execution. You'll probably end up using this to facilitate "Run all cells" functionality within your notebook front-end.

```js
<Prompt counter={12} queued />
```
