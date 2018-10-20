# Notebook Preview

Preview Jupyter notebooks in a small React component.

## Installation

You may use whichever package manager (`npm` or `yarn`) best suits your workflow. The `nteract` team internally uses `yarn`.

```bash
npm install --save @nteract/notebook-preview
# OR
yarn add @nteract/notebook-preview
```

## Usage

```jsx
import NotebookPreview from "@nteract/notebook-preview";

<NotebookPreview
  notebook={myNotebook}
/>
```
