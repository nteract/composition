```jsx static
import { Cells } from "@nteract/presentational-components";
```

`<Cells />` is a wrapper component to provide buffers between cells if you're building a notebook app.

```js
<Cells>
  <Cell>
    <Input>
      <Prompt counter={1} />
      <Source language="python">{`import pandas as pd`}</Source>
    </Input>
    <Outputs />
  </Cell>
  <Cell>
    <Input>
      <Prompt counter={2} />
      <Source language="python">{`df = pd.DataFrame([1,2,3])\ndisplay(df)`}</Source>
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
  <Cell isSelected>
    <Input>
      <Prompt running />
      <Source language="python">{`import time\ntime.sleep(9001)`}</Source>
    </Input>
    <Outputs />
  </Cell>
</Cells>
```
