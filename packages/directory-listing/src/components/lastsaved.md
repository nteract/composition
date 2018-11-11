```jsx static
import { LastSaved } from "@nteract/directory-listing";
```

The `LastSaved` component displays the time since the date provide in `lastModified` in human readable format. The date provided to the `lastModified` prop should be a valid JavaScript date.

```jsx
<LastSaved lastModified={"1986-03-27T16:21:25.354Z"} />
```
