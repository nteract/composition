The `DisplayData` component is a container component used to render rich media elements like images and HTML. This component acts as a simple switch on a set of rich media components. For example, we can define a component `Plain` that is responsible for rendering data with the `text/plain` media type and another component `Smooth` for rendering data with the `text/smooth` media type.

If you view the source, you'll notice that the component correctly rendered the `text/plain` data using the `Plain` component.

```jsx
// Some "rich" handlers for Media
const Plain = props => <marquee>{props.data}</marquee>;
Plain.defaultProps = {
  mediaType: "text/plain"
};

const Smooth = props => <p>{props.data}</p>;
Smooth.defaultProps = {
  mediaType: "text/smooth"
};

const output = {
  data: {
    "text/plain": "Jackfruit is the best food.",
    metadata: {},
    output_type: "display_data"
  }
};

<DisplayData output={output}>
  <Plain />
  <Smooth />
</DisplayData>;
```

You'll most likely end up using this component in conjunction with the Media components described [here](#media-outputs).
