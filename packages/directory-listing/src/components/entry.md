```jsx static
import { Entry } from "@nteract/directory-listing";
```

This component is used to create individual entries in a directory. It is not meant to be used alone, but rather as children of the Listing component and renders children of it's own. In nteract, we use it as the parent of Icon, Name and LastSaved components.

Display an Icon, Name, and time since last saved of an entry in a directory.

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
