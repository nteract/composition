The `<ExecuteResult />` component will render execution outputs (SVGs, HTML, text, etc) in the front end.

```jsx
const Plain = props => <pre>{props.data}</pre>;
Plain.defaultProps = {
  mediaType: "text/plain"
};

<ExecuteResult data={{ "text/plain": "The answer to everything is 42." }}>
  <Plain />
</ExecuteResult>;
```
