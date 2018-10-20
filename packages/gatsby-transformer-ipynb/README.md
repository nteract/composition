# gatsby-transformer-ipynb

Parses [jupyter](https://jupyter.org/) notebook files.

See it in action: <https://gatsby-contrib.github.io/gatsby-transformer-ipynb/>

## Install

`npm install --save @nteract/gatsby-transformer-ipynb`

## How to use

```javascript
// In your gatsby-config.js
plugins: [`@nteract/gatsby-transformer-ipynb`];
```

## Parsing algorithm

It recognizes files with the `ipynb` extension.

Each notebook file is parsed into a node of type `JupyterNotebook`.

This plugin adds additional fields to the `JupyterNotebook` GraphQL type
including:

- `html`: html string created using the react component `NotebookRender` from [`@nteract/notebook-render`](https://github.com/nteract/nteract/tree/master/packages/notebook-render).
- `metadata`: jupyter notebooks can embed metadata to indicate authors, titles...
- `json`: the json notebook code converted into a javascript object with `JSON.parse`.
- `internal.content`: contains the raw notebook code, it can be used to feed the react component `NotebookPreview` from [`@nteract/notebook-preview`](https://github.com/nteract/nteract/tree/master/packages/notebook-preview).

## How to query

A sample GraphQL query to get JupyterNotebook nodes:

```graphql
{
  query
  JupyterQuery {
    allJupyterNotebook {
      edges {
        node {
          id
          metadata {
            kernelspec {
              name
              language
              display_name
            }
          }
          html
          json {
            nbformat
            nbformat_minor
            cells {
              cell_type
              execution_count
            }
          }
          internal {
            content
          }
        }
      }
    }
  }
}
```
