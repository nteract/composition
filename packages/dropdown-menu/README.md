# @nteract/dropdown-menu

This package contains a React component for rendering the drop-down element on a single cell. This drop-down provides users with the ability to hide and show cells, convert cells between different types, and more.

## Installation

```
$ yarn add @nteract/dropdown-menu
```

```
$ npm install --save @nteract/dropdown-menu
```

## Usage

The example below showcases how we can use the components within this package to create a drop-down menu with actions specific to code cells.

```javascript
import {
  DropdownMenu,
  DropdownTrigger,
  DropdownContent
} from "@nteract/dropdown-menu";

export default () => {
  return (
    <DropdownMenu>
      <DropdownTrigger>
        <button title="show additional actions">
          <span className="octicon toggle-menu">
            <ChevronDownOcticon />
          </span>
        </button>
      </DropdownTrigger>
      {type === "code" ? (
        <DropdownContent>
          <li
            onClick={this.props.clearOutputs}
            className="clearOutput"
            role="option"
            aria-selected="false"
            tabIndex="0"
          >
            <a>Clear Cell Output</a>
          </li>
          <li
            onClick={this.props.toggleCellInputVisibility}
            className="inputVisibility"
            role="option"
            aria-selected="false"
            tabIndex="0"
          >
            <a>Toggle Input Visibility</a>
          </li>
        </DropdownContent>
      ) : null}
    </DropdownMenu>
  );
};
```

## Documentation

We're working on adding more documentation for this component. Stay tuned by watching this repository!

## Support

If you experience an issue while using this package or have a feature request, please file an issue on the [issue board](https://github.com/nteract/nteract/issues/new/choose) and add the `pkg:dropdown-menu` label.

## License

[BSD-3-Clause](https://choosealicense.com/licenses/bsd-3-clause/)
