The latest version of the notebook format ([v4](https://github.com/jupyter/nbformat/blob/master/nbformat/v4/nbformat.v4.schema.json)) includes support for several metadata fields embedded within the representation of the notebook itself. These metadata fields allow you to store information about the title and author of a notebook.

nteract provides a `HeaderEditor` component that you can use to allow end users to modify these attributes. The component will also allow you to edit the description and tags associated with the notebook.

```jsx static
import { HeaderEditor } from "@nteract/presentational-components";
```

To provide an editable `HeaderEditor`, you can set the value of the `editable` prop to `true`.

```js
class Editor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      authors: [{ name: "Elijah Meeks" }, { name: "Kyle Kelley" }],
      description: "A cool notebook for kids and animals!",
      title: "Notebook with Header",
      tags: ["amazing", "kids", "animals"]
    };
  }

  render() {
    return (
      <HeaderEditor
        editable={true}
        headerData={this.state}
        onChange={header => {
          this.setState(header);
        }}
      />
    );
  }
}

<Editor />;
```

If you'd like to use the the `HeaderEditor` component as a purely presentational component, you can set the `editable` prop to `false`. This will prevent end users from modifying the fields of the header. Try and see if you can edit the fields in the component below.

```js
<HeaderEditor
  editable={false}
  headerData={{
    authors: [{ name: "Elijah Meeks" }, { name: "Kyle Kelley" }],
    description: "A cool notebook for kids and animals!",
    title: "Notebook with Header",
    tags: ["amazing", "kids", "animals"]
  }}
/>
```

Assuming you don't provide the `HeaderEditor` component with initial data through the `headerData` prop, a basic component will be rendered that will invite users to add the necessary information. You can hover over the "+" icons and note the call-outs to add authors and tags.

```
<HeaderEditor />
```

You can pass a custom event handler to the `onChange` prop to persist or respond to changes in the fields. Note that the `onChange` function should take a parameter in the shape of HeaderData.

```plaintext
type AuthorObject = {
  name: string
};
type HeaderDataProps = {
  authors: Array<AuthorObject>,
  title: string,
  description: string,
  tags: Array<string>
};
```
The example below will alert with the header data whenever a field is modified. Try it out!

```
class Editor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      authors: [],
      description: "This will alert if you change one of the fields.",
      title: "Alert When Changed",
      tags: []
    };
  }

  render() {
    return (
      <HeaderEditor
        editable={true}
        headerData={this.state}
        onChange={header => {
          alert(JSON.stringify(header));
        }}
      />
    );
  }
}

<Editor />;
```