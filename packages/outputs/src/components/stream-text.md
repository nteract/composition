The Jupyter kernel will return outputs that contain data from standard out or standard error using the `stream` message type. The data contained in this messages consists of a string containing the contents of the output. To render these types of outputs from the kernel in your own Jupyter front-end, you can use the `StreamText` component.

The `StreamText` component takes a `text` prop which contains the contents of the stream. The `name` prop, which can be one of `stdout` or `stderr` dictates whether the text stream originated from standard out or standard error respectively.

```jsx
<StreamText output={{ name: "stderr", text: "hello world" }} />
```
