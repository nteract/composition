The dropdown menu used for cell actions is composed of three components that work with each other:

- `<DropdownMenu />` The outermost component
- `<DropdownTrigger />` The Clickable area that opens the menu
- `<DropdownContent />` The UI elements. Each clickable entry should be in an `<li>`

NOTE: This interface is pretty rough, so you'll have to excuse some strangeness for now. 😬

```jsx
const { DropdownMenu, DropdownTrigger, DropdownContent } = require("../");

const Entry = ({ children }) => (
  <li style={{ backgroundColor: "gray" }}>{children}</li>
);

<DropdownMenu>
  <DropdownTrigger>
    <p
      style={{
        backgroundColor: "gray",
        color: "white",
        padding: "10px",
        margin: "0px"
      }}
    >
      click me
    </p>
  </DropdownTrigger>
  <DropdownContent>
    <Entry>thing 1</Entry>
    <Entry>thing 2</Entry>
    <Entry>thing 3</Entry>
  </DropdownContent>
</DropdownMenu>;
```
