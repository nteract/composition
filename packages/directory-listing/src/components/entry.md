```jsx static
import { Entry } from "@nteract/directory-listing";
```

This component is used to create individual entries in a directory. It is not meant to be used alone, but rather as a child of the `Listing` component and renders children of its own. In nteract, we use it as the parent of the Icon, Name and LastSaved components in the [nteract-on-jupyter](https://github.com/nteract/nteract/tree/master/applications/jupyter-extension/nteract_on_jupyter) and [commuter](https://github.com/nteract/nteract/tree/master/applications/commuter) applications.

In the example below, we use the `Entry` component to display an icon, name, and time since last save of an entry in a directory.

```jsx
<Listing>
  <Entry>
    <Icon fileType="notebook" />
    <Name>
      <a href="https://nteract.io">Example-Notebook.ipynb</a>
    </Name>
    <LastSaved lastModified={new Date("2018-07-04")} />
  </Entry>
</Listing>
```
