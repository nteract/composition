# Display Area
Render Jupyter notebook outputs in a trim little React component.

## Installation

```
npm install @nteract/display-area
```

## Usage

```jsx
import { Display } from '@nteract/display-area'
<Display outputs={outputs} />
```

Here `outputs` is an Object with all the outputs of a cell. Note: this does require trim, clean editions of the multiline cells as is done in `@nteract/commutable`.

Used in context of a notebook, you will likely be extracting it from a cell:

```jsx
<Display outputs={this.props.cell.outputs} />
```
