# Styling UIs built with @nteract/stateful-components

NOTE: Styling support for @nteract/stateful-component is in-progress.

nteract's stateful components are unstyled by default. That's right -- a beautiful blank canvas for you to paint your own experience to.

You can style stateful components using either CSS-in-JS modules like styled-components or via stylesheets.

## Styling with styled-components

To style individual components with `styled-components` you can import them individually and style them as needed.

```
import { CodeCell } from "@nteract/stateful-components";
import styled from "styled-components";

const StyledCodeCell = styled(CodeCell)`
    // your styles are here
`
```

Alternativelly, you can style the pre-built `Notebook` component with styled-components and use class names to target individual components.

```
import { Notebook } from "@nteract/stateful-components"

const StyledNotebook = styled(Notebook)`
    .nteract-code-cells {
        background-color: blue;
    }
`
```

## Styling with stylesheets

To style with stylesheets, you can use element and combinator-based CSS selectors to desire styled elements as you wish.

The following table outlines each stateful component, its CSS classname, and other CSS classes that can be conditionally applied to it.

| Component | Class Name | Other Class Names |
| Prompt | | `.nteract-prompt-component` | |
| Output | `.nteract-output-component` | `.hidden .expanded` |
