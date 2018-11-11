`Outputs` is a container component for rendering the output of a particular cell. The output is response returned from the kernel as a result of the execution of a particular code cell.

```jsx static
import { Outputs } from "@nteract/presentational-components"
```

Similar to the `Input` component, the `Outputs` component exposes a `hidden` prop that you can use to determine whether or not to display the children of the presentational component. The `hidden` prop defaults to false, as you can see by viewing the source below.

```
<Outputs>
  <pre>You can see this.</pre>
</Outputs>
```

But can be set to `true` as in the example below.

```
<Outputs hidden={true}>
  <pre>You can't see this.</pre>
</Outputs>
```

`Outputs` also exposes an `expanded` flag which can be used to dictate whether the children of the container component should be collapsed or expanded to display all outputs. This is a useful prop to use when you want to limit or show the amount of information that is shown from large outputs. The `expanded` prop will default to `false` and collapse the contents of the cell.

You can use the `expanded` prop in conjunction with the `collapsed` property on cells within a Jupyter Notebook. This allows you to persist the state of an output and read from the persisted value.

When the `expanded` prop is set to `false`, you'll see an output like so.

```
<Outputs>
  <pre>stdout line 0</pre>
  <pre>stdout line 1</pre>
  <pre>stdout line 2</pre>
  <pre>stdout line 3</pre>
  <pre>stdout line 4</pre>
  <pre>stdout line 5</pre>
  <pre>stdout line 6</pre>
  <pre>stdout line 7</pre>
  <pre>stdout line 8</pre>
  <pre>stdout line 9</pre>
  <pre>stdout line 10</pre>
  <pre>stdout line 11</pre>
  <pre>stdout line 12</pre>
  <pre>stdout line 13</pre>
  <pre>stdout line 14</pre>
  <pre>stdout line 15</pre>
  <pre>stdout line 16</pre>
  <pre>stdout line 17</pre>
  <pre>stdout line 18</pre>
  <pre>stdout line 19</pre>
  <pre>stdout line 20</pre>
  <pre>stdout line 21</pre>
  <pre>stdout line 22</pre>
  <pre>stdout line 23</pre>
  <pre>stdout line 24</pre>
  <pre>stdout line 25</pre>
</ Outputs>
```

When it is set to `true`, you can see the entirety of the output without needing to scroll.

```
<Outputs expanded={true}>
  <pre>stdout line 0</pre>
  <pre>stdout line 1</pre>
  <pre>stdout line 2</pre>
  <pre>stdout line 3</pre>
  <pre>stdout line 4</pre>
  <pre>stdout line 5</pre>
  <pre>stdout line 6</pre>
  <pre>stdout line 7</pre>
  <pre>stdout line 8</pre>
  <pre>stdout line 9</pre>
  <pre>stdout line 10</pre>
  <pre>stdout line 11</pre>
  <pre>stdout line 12</pre>
  <pre>stdout line 13</pre>
  <pre>stdout line 14</pre>
  <pre>stdout line 15</pre>
  <pre>stdout line 16</pre>
  <pre>stdout line 17</pre>
  <pre>stdout line 18</pre>
  <pre>stdout line 19</pre>
  <pre>stdout line 20</pre>
  <pre>stdout line 21</pre>
  <pre>stdout line 22</pre>
  <pre>stdout line 23</pre>
  <pre>stdout line 24</pre>
  <pre>stdout line 25</pre>
</ Outputs>
```

You'll most likely use the `Outputs` container component in conjunction with the components documented in [Outputs](#outputs) below.
