```jsx static
import {
  Entry,
  Listing,
  Icon,
  Name,
  LastSaved
} from "@nteract/directory-listing";
```

The `Listing` component is a container component to show any listing of directories and files in a tabular layout for users. This component works best with `<Entry>` for each item in a content listing.

```jsx
<Listing>
  <Entry>
    <Icon fileType="notebook" />
    <Name>
      <a href="#listing">GANS-for-days.ipynb</a>
    </Name>
    <LastSaved lastModified="2018-06-27T16:21:25.354Z" />
  </Entry>

  <Entry>
    <Icon fileType="directory" />
    <Name>
      <a href="#listing">home</a>
    </Name>
    <LastSaved lastModified="2018-03-27T16:21:25.354Z" />
  </Entry>

  <Entry>
    <Icon fileType="file" />
    <Name>
      <a href="#listing">component.js</a>
    </Name>
    <LastSaved lastModified={new Date("2018-05-27T16:21:25.354Z")} />
  </Entry>
  <Entry>
    <Icon fileType="file" color="gray" />
    <Name>
      <i style={{ color: "gray" }}>no-permission-file.md</i>
    </Name>
    <LastSaved lastModified={new Date("2018-05-27T16:21:25.354Z")} />
  </Entry>
</Listing>
```
