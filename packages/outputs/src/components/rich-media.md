```jsx
const Media = require("./media");

/**
 * First we'll create some simple components that take data and a mediaType for rendering
 */
const Plain = props => <pre>{props.data}</pre>;
Plain.defaultProps = {
  mediaType: "text/plain"
};

<RichMedia
  data={{
    "text/plain": "plain is sooooo basic",
    "text/html": "<p>I pick the <b>richest</b> to <i>render</i>!</p>"
  }}
>
  <Media.HTML />
  <Plain />
</RichMedia>;
```

For further information on the `<RichMedia />` component, keep reading! 👓 📚

### Media Bundles

Jupyter kernels are able to emit rich [media](https://www.iana.org/assignments/media-types/media-types.xhtml) like images, json, text, html, and many others. They're the core of what makes notebooks and consoles _so expressive_. They're sent over the jupyter messaging protocol and stored in the notebook just like this:

```json
{
  "text/plain": "SparkContext ⚡️",
  "text/html": "<b>SparkContext ⚡️</b>",
  "application/json": {
    "spark": "awesome ⚡️",
    "version": 2
  }
}
```

This object structure is called a **media bundle** (formerly known as a mimebundle), so dubbed because it's a bundle of [media types](https://www.iana.org/assignments/media-types/media-types.xhtml) and associated data. Jupyter frontends pick the _richest_ media type amongst these for rendering for the user, by selecting via a **display order**.

As an example, if the display order is:

```json
["text/html", "application/json", "text/plain"]
```

Then the frontend will prefer HTML instead of JSON and JSON over plaintext. To render any one of these, we write a React Element that takes at least the prop `data`:

```jsx static
const Plain = props => <pre>{props.data}</pre>;

Plain.defaulProps = {
  mediaType: "text/plain"
};
```

They can also accept `metadata` if there is additional configuration allowed. Take for example images which allow setting the size via `metadata`:

```jsx static
const ImageMedia = props => (
  <img
    alt=""
    src={`data:${props.mediatype};base64,${props.data}`}
    {...props.metadata.size}
  />
);
ImageMedia.defaultProps = {
  mediaType: "image/png"
};
```

There are several different jupyter message types that include these objects:

- [`execute_result`](http://jupyter-client.readthedocs.io/en/stable/messaging.html#id6)
- [`display_data`](http://jupyter-client.readthedocs.io/en/stable/messaging.html#display-data) and [`update_display_data`](http://jupyter-client.readthedocs.io/en/stable/messaging.html#update-display-data)
- [`inspect_reply`](http://jupyter-client.readthedocs.io/en/stable/messaging.html#introspection)
- [`payload`'s `page`](http://jupyter-client.readthedocs.io/en/stable/messaging.html#payloads-deprecated)

### Displaying Rich Media with `<RichMedia />`

The `<RichMedia />` component accepts the whole media bundle from a kernel via the `data` prop and all the elements for rendering media types as `children`. The order of the children states their richness from highest to lowest.

```jsx static
const Media = require('./media')

<RichMedia data={{ "text/plain": "SparkContext ⚡️" }}>
  <Media.HTML />
  <Media.Plain />
</RichMedia>
```

The `<RichMedia />` component will pass the appropriate data from the media bundle to the element that accepts the media type. In this case, `<Plain />` is picked as the richest since `text/plain` is the only available. `"SparkContext ⚡️"` is passed as `<Plain data="SparkContext ⚡️" />` to render the richest media.

```jsx
const Media = require("./media");

<RichMedia data={{ "text/plain": "SparkContext ⚡️" }}>
  <Media.HTML />
  <Media.Plain />
</RichMedia>;
```

Whereas this output has a richer HTML output:

```jsx
const Media = require("./media");

<RichMedia
  data={{
    "text/plain": "plain was richer",
    "text/html": "<b>HTML is so rich</b>"
  }}
>
  <Media.HTML />
  <Media.Plain />
</RichMedia>;
```

Without any valid choices, it renders nothing!

```jsx
<RichMedia
  data={{
    "text/plain": "plain was richer",
    "text/html": "<b>HTML was richer</b>"
  }}
/>
```

### Passing Props

Since the children are React elements, we can pass custom props that will get rendered with the data:

```jsx
const Special = props =>
  props.big ? <h1>Big {props.data}</h1> : <p>Small {props.data}</p>;
Special.defaultProps = {
  big: false,
  mediaType: "text/special"
};

const Plain = props => <pre>{props.data}</pre>;
Plain.defaultProps = {
  mediaType: "text/plain"
};

<div>
  <RichMedia
    data={{
      "text/special": "Happy Day"
    }}
  >
    <Special big />
    <Plain />
  </RichMedia>
  <RichMedia
    data={{
      "text/special": "Happy Day"
    }}
  >
    <Special />
    <Plain />
  </RichMedia>
</div>;
```

Which means that you can customize outputs as props!

```jsx
const Media = require("./media");

// Pretend this is the data explorer :)
const FancyTable = props => (
  <table style={{ border: `2px solid ${props.color}` }}>
    <tbody>
      {props.data.map((row, idx) => (
        <tr key={idx}>
          {row.map((datum, idx) => (
            <td key={idx} style={{ border: `1px dashed ${props.color}` }}>
              {datum}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
);

FancyTable.defaultProps = {
  mediaType: "fancy/table"
};

class Output extends React.Component {
  constructor(props) {
    super(props);
    this.state = { color: "#e66465" };
  }

  render() {
    return (
      <div>
        <div style={{ marginBottom: "20px" }}>
          <label>Pick a color for the table </label>
          <input
            type="color"
            value={this.state.color}
            onChange={e => this.setState({ color: e.target.value })}
          />
        </div>
        <RichMedia
          data={{
            "text/plain": "1,2,3\n4,5,6\n",
            "text/html":
              "<table><tbody><tr><td>1</td><td>2</td><td>3</td></tr><tr><td>4</td><td>5</td><td>6</td></tr></tbody></table>",
            "fancy/table": [[1, 2, 3], [4, 5, 6]]
          }}
        >
          <FancyTable color={this.state.color} />
          <Media.HTML />
          <Media.Plain />
        </RichMedia>
      </div>
    );
  }
}

<Output />;
```

### Handling Errors from `<Media />` components

The `<RichMedia />` component comes with a built-in `componentDidCatch` fallback. To spare this style guide from being spammed with errors, we're not showing the error. To trigger it, uncomment the `throw new Error` line after clicking "View Code"

```jsx
const Plain = props => {
  // throw new Error("💥 Broken Media Component");
  return <pre>{props.data}</pre>;
};
Plain.defaultProps = {
  mediaType: "text/plain"
};

<RichMedia
  data={{
    "text/plain": "Click View Code below to edit"
  }}
>
  <Plain />
</RichMedia>;
```

You can override the error formatting by passing a render callback as `renderError`. It takes all the props that `<RichMedia />` itself takes. As an example, here's a component that auto-creates an issue based on the data.

```jsx
/* Purposefully broken component */
const Plain = props => {
  // throw new Error("💥 Broken Media Component");
  return <pre>{props.data}</pre>;
};
Plain.defaultProps = {
  mediaType: "text/plain"
};

/* Custom Error Reporter component  */
const IssueCreator = ({ error, info, data }) => {
  const body = encodeURIComponent(`
Help! Something weird happened with an output!

Media Types:
${Object.keys(data).map(k => `* ${k}`)}

\`\`\`
${error.toString()}
${info.componentStack}
\`\`\`
`);

  const title = encodeURIComponent("Output Rendering Issue");

  const link = `https://github.com/nteract/hydrogen/issues/new?title=${title}&body=${body}`;

  return (
    <div>
      <h5
        style={{
          backgroundColor: "hsl(0, 100%, 95%)",
          color: "hsl(180, 10%, 30%)",
          padding: "10px",
          margin: "0"
        }}
      >
        We couldn't render your output. 😭 Please post
        <a href={link} style={{ color: "hsl(0, 0%, 30%)" }}>
          an issue for the hydrogen devs
        </a> to take a look
      </h5>
      <pre
        style={{
          backgroundColor: "hsl(60, 100%, 95%)",
          padding: "10px",
          whiteSpace: "pre-wrap",
          wordWrap: "break-word",
          margin: "0"
        }}
      >
        {error.toString()}
        {info.componentStack}
      </pre>
    </div>
  );
};

<RichMedia
  data={{
    "text/plain": "Click View Code below to edit"
  }}
  renderError={IssueCreator}
>
  <Plain />
</RichMedia>;
```

⚠️ `this.props.data` can contain sensitive data, so be mindful of what you enable for automatically populating an issue with ⚠️
