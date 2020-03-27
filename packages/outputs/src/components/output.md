The `Output` element takes a single `output` prop and several child components and renders the appropriate components to render each output type.

For example, we can create a `stream` output and use the `Output` and `StreamText` components needed for each output type.

```jsx
// Until we create <Stream />
const { StreamText } = require("./stream-text");

const output = Object.freeze({
  output_type: "stream",
  text: "Hello World\nHow are you?",
  name: "stdout"
});

<Output output={output}>
  <StreamText />
</Output>;
```

Errors returned from the connected Jupyter kernel can be rendered.

```jsx
const { KernelOutputError } = require("./kernel-output-error");

const output = Object.freeze({
  output_type: "error",
  ename: "NameError",
  evalue: "Yikes!",
  traceback: ["Yikes, never heard of that one!"]
});

<Output output={output}>
  <KernelOutputError />
</Output>;
```

The examples above are simple but we can use `Output` and our `Output`-related components to render even more complex structures. In the example below, we have an output that consists of a variety of output types such as stream and data display outputs. By passing the correct output and media types and passing their matching components as children, we can render a variety of outputs.

```jsx
const { RichMedia } = require("./rich-media");
const { DisplayData } = require("./display-data");

const { StreamText } = require("./stream-text");

// Some "rich" handlers for Media
const Plain = props => <marquee>{props.data}</marquee>;
Plain.defaultProps = {
  mediaType: "text/plain"
};

const HTML = props => <div dangerouslySetInnerHTML={{ __html: props.data }} />;
HTML.defaultProps = {
  mediaType: "text/html"
};

const outputs = [
  {
    output_type: "stream",
    text: "Hello World\nHow are you?",
    name: "stdout"
  },
  {
    output_type: "display_data",
    data: {
      "text/plain": "O____O"
    },
    metadata: {}
  },
  {
    output_type: "display_data",
    data: {
      "text/html": "<p>This is some HTML.</p>"
    },
    metadata: {}
  },
  {
    output_type: "stream",
    text: "Pretty good I would say",
    name: "stdout"
  }
];

<div>
  {outputs.map((output, index) => (
    <Output output={output} key={index}>
      <StreamText />
      <DisplayData>
        <Plain />
        <HTML />
      </DisplayData>
    </Output>
  ))}
</div>;
```

This structure also allows you to create your own components to override how a given output type is rendered. Below is an example that overrides the component to support `display_data` output types with a component that always renders the same thing.

```jsx
const { StreamText } = require("./stream-text");

// Our own DisplayData component
const MyDisplayData = props => (
  <p>
    <b>MyDisplayData.</b>
  </p>
);
MyDisplayData.defaultProps = {
  output_type: "display_data"
};

// Some "rich" handlers for Media. These aren't going to be
// used becuase our custom MyDisplayData component doesn't do anything
// with its child components.
const Plain = props => <marquee>{props.data}</marquee>;
Plain.defaultProps = {
  mediaType: "text/plain"
};

const HTML = props => <div dangerouslySetInnerHTML={{ __html: props.data }} />;
HTML.defaultProps = {
  mediaType: "text/html"
};

const outputs = [
  {
    output_type: "display_data",
    data: {
      "text/plain": "O____O"
    },
    metadata: {}
  },
  {
    output_type: "display_data",
    data: {
      "text/html": "<p>This is some HTML.</p>"
    },
    metadata: {}
  }
];

<div>
  {outputs.map((output, index) => (
    <Output output={output} key={index}>
      <MyDisplayData>
        <Plain />
        <HTML />
      </MyDisplayData>
    </Output>
  ))}
</div>;
```

If your app handles both `display_data` and `execute_result` output types in
the same manner, you can pass an `output_type` array instead of a string.

```jsx
const Media = require("./media/");
const { RichMedia } = require("./rich-media");
const DisplayData = require("./display-data");

// Our custom DisplayData/ExecuteResult component
function CompositeOutput(props) {
  const { output, children } = props;

  return (
    <RichMedia data={output.data} metadata={output.metadata}>
      {children}
    </RichMedia>
  );
}
CompositeOutput.defaultProps = {
  output: null,
  output_type: ["display_data", "execute_result"]
};

const displayOutput = {
  output_type: "display_data",
  data: {
    "text/html":
      "<p>This is a <code>display_data</code> HTML output that <b>WILL</b> render</p>",
    "text/plain": "This is some plain text that WILL NOT render"
  }
};

const executeResultOutput = {
  output_type: "execute_result",
  data: {
    "text/html":
      "<p>This is an <code>execute_result</code> HTML output that <b>WILL</b> render</p>",
    "text/plain": "This is some plain text that WILL NOT render"
  }
};

// Try replacing `executeResultOutput` with `displayOutput`
// both output_type will render as expected
<Output output={executeResultOutput}>
  <CompositeOutput>
    <Media.Json />
    <Media.HTML />
    <Media.Plain />
  </CompositeOutput>
</Output>;
```
