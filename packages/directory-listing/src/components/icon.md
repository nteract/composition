```jsx static
import { Icon } from "@nteract/directory-listing";
```

This component displays an icon for a particular file. The `fileType` prop can be one of "unknown", "notebook", "directory", "file", "dummy" to render the corresponding icon. Below are examples of each file type icon.

```jsx
<Icon fileType="unkown" />
<Icon fileType="notebook" />
<Icon fileType="directory" />
<Icon fileType="file" />
<Icon fileType="dummy" />
```

The component also takes a `color` prop that allows you to change the color of the icon by providing a valid hex, HTML, RGB, or HSL color code. See the source code for the example below to see how you can use the `color` prop to add some style to your icons!

```jsx
<Icon fileType="unkown" color="salmon"/>
<Icon fileType="notebook" color="rgb(34 12 64 / 0.6)"/>
<Icon fileType="directory" color="#009900"/>
<Icon fileType="file" color="hsl(30 100% 50% / 0.6)"/>
<Icon fileType="dummy" color="red"/>
```