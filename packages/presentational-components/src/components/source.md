The `Source` component is a container component that renders
syntax highlighted source code. 

```jsx static
import { Source } from "@nteract/presentational-components";
```

If the child component passed to `Source` is a string, it will automatically be rendered using nteract's internal source code highlighter.

```js
<Source language="python">{`import python

print("Hello from nteract.")`}</Source>
```

To define the language that you'd like to use when highlighting source, you can use the `language` prop. Under the hood, the `Source` component uses the [Prism](https://prismjs.com/) syntax highlighter. You can view the [full list of languages supported](https://prismjs.com/#languages-list) by this highlighter to determine what value you should pass to the `language` prop based on your needs.

You can pass the `text/x-{languageName}` format to the `langauge` prop. This is designed to make it easier to interact with the `language_info.mimetype` property contained in the Jupyter Notebook format.

```js
<Source language="text/x-scala">{`import org.apache.hadoop.fs.Pathorg.apa
import com.netflix.iceberg.hadoop.HadoopTables
import com.netflix.iceberg.spark.SparkSchemaUtil

val path = "hdfs:/tmp/tables/job_metrics_tmp"

{ // use a block to avoid values (conf, etc.) getting caught in closures

    // remove the temp table if it already exists
    val conf = spark.sparkContext.hadoopConfiguration
    val fs = new Path(path).getFileSystem(conf)
    fs.delete(new Path(path), true /* recursive */ )

    // create the temp table using Spark utils to create a schema and partition spec
    val tables = new HadoopTables(conf)
    val schema = SparkSchemaUtil.schemaForTable(spark, "default.job_metrics")
    val spec = SparkSchemaUtil.specForTable(spark, "default.job_metrics")

    tables.create(schema, spec, path)

    // show the schema
    tables.load(path).schema
}`}</Source>
```

You can use the `className` prop to add your own CSS-based styles to the highlighted source.

### Bring your own editor

You can ass React component(s) inside of `<Source />` to provide your own editor. For example, here we use a styled `textarea` to render some Python text.

```js
<Source>
  <textarea
    style={{
      fontFamily: `"Dank Mono", "Source Code Pro", Consolas, "Courier New", Courier,  monospace`,
      backgroundColor: `#fafafa`,
      color: `#212121`,
      fontSize: "1em",
      height: "10em",
      border: "none",
      width: "100%"
    }}
    defaultValue={`import python

print("Hello nteract.")`}
  />
</Source>
```

_NOTE: The notebook apps use this method to pass the Codemirror editor as the child._

Since this component is just a wrapper to keep styling consistent, you can pass all the `onChange` handlers you want to your own component.

```js
class Editor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: "import pandas as pd\nimport numpy as np\n\npd.DataFrame()"
    };
  }

  render() {
    return (
      <Source>
        <textarea
          onChange={evt => {
            console.log(evt.target.value);
            this.setState({ value: evt.target.value });
          }}
          style={{
            fontFamily: `"Dank Mono", "Source Code Pro", Consolas, "Courier New", Courier,  monospace`,
            backgroundColor: `#fafafa`,
            color: `#212121`,
            fontSize: "1em",
            height: "10em",
            border: "none",
            width: "100%"
          }}
          value={this.state.value}
        />
      </Source>
    );
  }
}

<Editor />;
```