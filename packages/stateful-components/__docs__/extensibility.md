# Extending your notebook UI with @nteract/stateful-components

This suite of React components provides several points of extensibility for the UI. This document covers them here.

## Extending Editors

nteract ships with the CodeMirror editor in its desktop and Jupyter extensions. However, you might want to use an alternative editor in your own notebook based UI. To add your own editor to the nteract UI, create a React component that encompasses the editor.

```
class MyCoolEditor extends React.Component {
    static defaultProps = {
        editorType = "myeditor"
    }

    render() {
        return <textarea/>
    }
}
```

The `editorType` default prop is important here. The `editorType` is used to select between different types of editors.

```
import { Editor } from "@nteract/stateful-components"
import CodeMirrorEditor from "@nteract/editor"
import MyCoolEditor from "./my-cool-editor";

class Editor extends React.Component {
    render() {
        return <Editor id={cellId} contentRef={contentRef}>
            <CodeMirrorEditor />
            <MyCoolEditor />
        </Editor>;
    }
}
```

The `Editor` stateful component take a `cellId` and a `contentRef`, extracts the relevant state properties from the state, and passes them to the child editors.

## Extending Cells

The @nteract/stateful-components package ships with a default set of implementations for different types of cells: markdown, code, and raw. How do you go about adding your own set of cells?

You can override the children of the `Cells` component and render your own custom `Cell` components for each cell_type. For example, to override the default `MarkdownCell`, you can do the following.

```
import { Cells, CodeCell, RawCell } from "@nteract/stateful-components"

class MarkdownCell extends React.Component {
    static defaultProps = {
        cell_type: "markdown"
    }

    render() {
        return <p>{this.props.value}</p>;
    }
}

class MyCells extends React.Component {
    render() {
        return <Cells>
            <MarkdownCell id={cellId} contentRef={contentRef}/>
            <CodeCell id={cellId} contentRef={contentRef}/>
            <RawCell id={cellId} contentRef={contentRef}/>
        </Cells>
    }
}
```

Similar to the pattern for creating configurable editors, configurable cells require that a `cell_type` prop exist on the child component that matches the `cell_type` the component is intended to render.

## Display Name-based Component Overrides

We've all been in that situation where we were generally happy with something but wanted one small thing changed. The "Extending Cells" pattern provides a strategy for overriding the entire default implementation for cells exported by nteract, but what if we wanted to override only particular components.

The @nteract/stateful-components package has support for display name-based component overrides. For example, let's say you want to override just the `Prompt` component within a CodeCell. You can do this by defining your own `Prompt` component and setting the display name to `Prompt`.

```
class MyPrompt extends React.Component {
    static displayName = "Prompt";

    render() {
        return <p>Your custom prompt here</p>;
    }
}
```

Then passing that `Prompt` component as a child to the `CodeCell` component exported by nteract.

```
import { CodeCell } from "@nteract/stateful-components";

class MyCodeCell extends React.Component {
    render() {
        return <CodeCell>
            <Prompt>
        </CodeCell>
    }
}
```

Display name-based overrides are currently enabled for the following parent and child components.

| Parent Component | Child Component |
| ---------------- | --------------- |
| CodeCell         | Pagers          |
| CodeCell         | Prompt          |
| CodeCell         | Outputs         |
| CodeCell         | Editors         |

Since this override interface depends on having the display name on the React component set to the name of the child component, be sure that the display names for your overrides are set correctly.
