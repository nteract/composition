# Display Area
Render Jupyter notebook outputs in a trim little React component.

## Installation

You may use whichever package manager (`npm` or `yarn`) best suits your workflow. The `nteract` team internally uses `yarn`.

```bash
npm install @nteract/display-area
# OR
yarn add @nteract/display-area
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
