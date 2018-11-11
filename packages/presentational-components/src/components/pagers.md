The `Pagers` component is a container component that serves as the container for the pagers of a cell. Pagers are generally used to display information that is not an output. For example, you might use a pager to display the output of an introspection command like `pd?`. For an example, take a look at the screenshot below.

```jsx noeditor
<img
  alt="A screenshot containing an example of a code cell that uses both outputs and pagers."
  src="https://cldup.com/BXhT1UNTDL.png"
  style={{ width: "100%" }}
/>
```

You'll generally have both a `Pagers` component and an `Outputs` component as part of your notebook cell. `Outputs` typically contain calculation results or actions on a cell, and `Pagers` hold information, like help text, found from introspecting a cell.

```jsx static
import { Pagers } from "@nteract/presentational-components"
```

Similar to other components, the `Pagers`  component provides a `hidden` flag that determines whether or not the contents of the component should be rendered. You can try it out below by toggling the value of the `hidden` prop in the code from `false` to `true`.

```
<Pagers hidden={false}>
This is a pager.
</Pagers>
```

Since `Pagers` are displayed alongside `Outputs`, you'll notice that the background color of the `Pagers` component is slightly different to distinguish between the two.
