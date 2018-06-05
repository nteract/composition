The dropdown menu used for cell actions is composed of three components that work with each other:

- `<DropdownMenu />` The outermost component
- `<DropdownTrigger />` The Clickable area that opens the menu
- `<DropdownContent />` The UI elements. Each clickable entry should be in an `<li>`

NOTE: This interface is pretty rough, so you'll have to excuse some strangeness for now. 😬

```jsx
const { DropdownMenu, DropdownTrigger, DropdownContent } = require("../");

const triggerStyle = {
  backgroundColor: "#F5D541",
  color: "#AC8EBC",
  padding: "10px",
  margin: "0px",
  width: "100px"
};

const itemStyle = {
  backgroundColor: "#AC8EBC",
  color: "#F5D541"
};

<div>
  <DropdownMenu>
    <DropdownTrigger>
      <p style={triggerStyle}>Drop It</p>
    </DropdownTrigger>
    <DropdownContent>
      <li style={itemStyle} onClick={() => console.log("Try it with me")}>
        Pop It
      </li>
      <li style={itemStyle} onClick={() => console.log("Here we go")}>
        Lock It
      </li>
      <li style={itemStyle} onClick={() => console.log("Boom boom clap")}>
        Polka Dot It
      </li>
    </DropdownContent>
  </DropdownMenu>
</div>;
```

The primary purpose of this component is to have some hidden option to take as actions. Within the cell UI, this forms the cell actions area.
