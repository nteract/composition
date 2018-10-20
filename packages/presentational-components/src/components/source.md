```jsx static
import { Source } from "@nteract/presentational-components";
```

Syntax highlight source code. Pass a child component to override with your own editor or syntax highlighting implementation.

### Syntax Highlight

```js
<Source language="python">{`import python

print("Hello from nteract.")`}</Source>
```

Supports highlighting Scala too, whether specified as `text/x-scala` (codemirror mimetype) or `scala`:

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

### Bring your own editor

Pass React component(s) inside of `<Source />` to provide your own editor.

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

_NOTE: The notebook apps use this to pass the codemirror editor as the child._

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
            this.setState({ value: evt.target.value });
            console.log(evt.target.value);
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
