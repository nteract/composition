# Notebook Preview

This package provides a small React component that allows to render notebooks server-side with `ReactDOMServer.renderToStaticMarkup()`.

Markdown is parsed with `marked`, and maths are rendered with `katex` so you need to include the katex.css stylesheet in your page.

## Installation

```
npm install --save @nteract/notebook-render
```

## Usage

```jsx
// create html rendering notebook with @nteract/notebook-preview
const reactComponent = React.createElement(
  NotebookPreview,
  {
    notebook: notebook
  },
  null
);

const html = ReactDOMServer.renderToStaticMarkup(reactComponent);
```