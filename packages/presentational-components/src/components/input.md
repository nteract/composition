The `Input` component is a container component that serves as a container for the `Input` of a cell.


```jsx static
import { Input } from "@nteract/presentational-components"
```

The `Input` component provides a `hidden` prop which you can use to dictate whether or not the children of the container are rendered. The default value is set to `true`, so you'll see the text "You can see this." rendered here.

```
<Input>
You can see this.
</ Input>
```

You can also set the prop to `true` to hide all children. Take a look at the code for the component below to see how.

```
<Input hidden={true}>
You can't see this.
</ Input>
```

Since the `Input` component serves as a light container for its children, you'll most often need to use this component in conjunction with the `Prompt` and `Source` components, as seen below. You can learn more about `Prompt` [here](#prompt) and `Source` [here](#source).

```
const { Prompt, Source } = require("@nteract/presentational-components");
<Input>
<Prompt/>
<Source/>
</Input>
```
