```jsx static
import { Cell } from "@nteract/presentational-components";
```

All by itself, this component doesn't do anything. Used with `<Input />`, `<Source />`, and `<Outputs />`, it brings styling to the children
based on hover and **selected** states.

By moving a cursor over the component and hovering, styling can be changed.

```js
<Cell>
  <Input>
    <Prompt counter={1} />
    <Source language="python">{`import pandas as pd\npd.DataFrame([1,2,3])\n\n# Alternate between hovering the cursor over this cell and outside of the cell`}</Source>
  </Input>
  <Outputs>
    <div>
      <style scoped>{`
          .dataframe tbody tr th:only-of-type {
              vertical-align: middle;
          }

          .dataframe tbody tr th {
              vertical-align: top;
          }

          .dataframe thead th {
              text-align: right;
          }
      `}</style>
      <table border="1" className="dataframe">
        <thead>
          <tr style={{ textAlign: "right" }}>
            <th />
            <th>0</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>0</th>
            <td>1</td>
          </tr>
          <tr>
            <th>1</th>
            <td>2</td>
          </tr>
          <tr>
            <th>2</th>
            <td>3</td>
          </tr>
        </tbody>
      </table>
    </div>
  </Outputs>
</Cell>
```

A `<Cell />` can be set as selected to **raise** it up.

```js
<Cell isSelected>
  <Input>
    <Prompt counter={2} />
    <Source language="python">{`print("Hello World")`}</Source>
  </Input>
  <Outputs>
    <pre>Hello World</pre>
  </Outputs>
</Cell>
```

A cell can be in one of three levels, similar to raised cards:

1.  _Flat_ on the "page"
2.  _Slight_ rise, mid way to fully active, while hovering (`_hovered` prop is `true`)
3.  _Raised_ up highest, when fully active (i.e. `isSelected` prop is `true`) --
    the editor should be focused when this level is used

```js
<Cells>
  <Cell>
    <Input>
      <Prompt />
      <Source language="python">{`# Level 0 - Flat`}</Source>
    </Input>
    <Outputs>
      <pre>Output</pre>
    </Outputs>
  </Cell>
  <Cell _hovered>
    <Input>
      <Prompt />
      <Source language="python">{`# Level 1 - Slight`}</Source>
    </Input>
    <Outputs>
      <pre>Output</pre>
    </Outputs>
  </Cell>
  <Cell isSelected>
    <Input>
      <Prompt />
      <Source language="python">{`# Level 2 - Raised`}</Source>
    </Input>
    <Outputs>
      <pre>Output</pre>
    </Outputs>
  </Cell>
</Cells>
```
