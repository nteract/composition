The `<DisplayData />` component will render data (SVGs, HTML, text, etc) in the front end.

```jsx
// Some "rich" handlers for Media
const Plain = props => <marquee>{props.data}</marquee>;
Plain.defaultProps = {
  mediaType: "text/plain"
};

<DisplayData data={{ "text/plain": "Jackfruit is the best food." }}>
  <Plain />
</DisplayData>;
```
