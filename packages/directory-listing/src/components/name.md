```jsx static
import { Name } from "@nteract/directory-listing";
```

The `Name` is a container component can be used to show a stylized name of the file or directory in a listing. Generally, you'll want the child of this component to be a link to the path of the file that you'd like the user to click to open.

```jsx
<Name>
  <a href="#name">Example-Notebook.ipynb</a>
</Name>
```
