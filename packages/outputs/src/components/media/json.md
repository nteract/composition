JSON, or JavaScript Object Notation, is a popular data format that represents its contents in a human-readable form. JSON consists of a series of attribute value pairs, like `name: "Tester McTester"`.

You can render JSON data into an explorable tree-like structure using the `Media.Json` component. JSON data is identified using the `application/json` media type.

```
<Json data={{ name: "Tester McTester", age: 20, location: "The North Pole", job: { title: "Senior Engineer", employer: { name: "Acme Inc.", id: 1 } } }}/>
```

Any nested JSON data will be rendered in expanded form by default. If you would like to render nested data in collapsed form by default, you can pass the object `{ expanded: false }` to the `metadata` prop.

```
<Json metadata={{expanded: false}} data={{ name: "Tester McTester", age: 20, location: "The North Pole", job: { title: "Senior Engineer", employer: { name: "Acme Inc.", id: 1 } } }}/>
```