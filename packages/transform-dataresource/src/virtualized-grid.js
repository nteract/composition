/* @flow */
import React from "react";
import { MultiGrid, AutoSizer, ColumnSizer } from "react-virtualized";
import { infer } from "jsontableschema";

const ROW_HEIGHT = 36;
const GRID_MAX_HEIGHT = ROW_HEIGHT * 10;
// The number of sample rows that should be used to infer types for columns
// and widths for columns
const SAMPLE_SIZE = 10;

type Props = {
  data: Array<Object>,
  schema: { fields: Array<Object> },
  theme: string
};

type State = {
  data: Array<Object>,
  schema: { fields: Array<Object> }
};

function getSampleRows(data: Array<Object>, sampleSize: number): Array<Object> {
  return Array.from({ length: sampleSize }, () => {
    const index = Math.floor(Math.random() * data.length);
    return data[index];
  });
}

function inferSchema(data: Array<Object>): { fields: Array<Object> } {
  const sampleRows = getSampleRows(data, SAMPLE_SIZE);
  const headers = Array.from(
    sampleRows.reduce(
      (result, row) => new Set([...Array.from(result), ...Object.keys(row)]),
      new Set()
    )
  );
  const values = sampleRows.map(row => Object.values(row));
  return infer(headers, values);
}

function getState(props: Props) {
  const data = props.data;
  const schema = props.schema || inferSchema(data);
  const columns = schema.fields.map(field => field.name);
  const headers = columns.reduce(
    (result, column) => ({ ...result, [column]: column }),
    {}
  );
  return {
    data: [headers, ...data],
    schema
  };
}

export default class VirtualizedGrid extends React.Component {
  props: Props;
  state: State = {
    data: [],
    schema: { fields: [] }
  };

  componentWillMount() {
    const state = getState(this.props);
    this.setState(state);
  }

  componentWillReceiveProps(nextProps: Props) {
    const state = getState(nextProps);
    this.setState(state);
  }

  cellRenderer = ({
    columnIndex,
    key,
    parent,
    rowIndex,
    style
  }: {
    columnIndex: number,
    key: string,
    parent: mixed,
    rowIndex: number,
    style: Object
  }) => {
    const { name: column, type } = this.state.schema.fields[columnIndex];
    const value = this.state.data[rowIndex][column];
    return (
      <div
        key={key}
        className={rowIndex === 0 || columnIndex === 0 ? "th" : "td"}
        style={styles.cell({ columnIndex, rowIndex, style, type })}
      >
        {value}
      </div>
    );
  };

  render() {
    const rowCount = this.state.data.length;
    const height = rowCount * ROW_HEIGHT > GRID_MAX_HEIGHT
      ? GRID_MAX_HEIGHT
      : rowCount * ROW_HEIGHT;
    return (
      <AutoSizer>
        {({ width, height }) => (
          <ColumnSizer
            columnMaxWidth={300}
            columnMinWidth={50}
            columnCount={this.state.schema.fields.length}
            width={width}
          >
            {({ adjustedWidth, getColumnWidth, registerChild }) => (
              <MultiGrid
                ref={registerChild}
                cellRenderer={this.cellRenderer}
                columnCount={this.state.schema.fields.length}
                columnWidth={getColumnWidth}
                fixedColumnCount={1}
                fixedRowCount={1}
                height={height}
                overscanColumnCount={15}
                overscanRowCount={150}
                rowCount={rowCount}
                rowHeight={ROW_HEIGHT}
                width={adjustedWidth}
              />
            )}
          </ColumnSizer>
        )}
      </AutoSizer>
    );
  }
}

const styles = {
  cell: ({ columnIndex, rowIndex, style, type }) => ({
    ...style,
    boxSizing: "border-box",
    padding: "0.5em 1em",
    border: "1px solid #ddd",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    // Remove top border for all cells except first row
    ...(rowIndex !== 0 ? { borderTop: "none" } : {}),
    // Remove left border for all cells except first column
    ...(columnIndex !== 0 ? { borderLeft: "none" } : {}),
    // Highlight even rows
    ...(rowIndex % 2 === 0 && !(rowIndex === 0 || columnIndex === 0)
      ? { background: "rgba(0, 0, 0, 0.03)" }
      : {}),
    // Bold the headers
    ...(rowIndex === 0 || columnIndex === 0
      ? {
          background: "rgba(0, 0, 0, 0.06)",
          fontWeight: "bold"
        }
      : {}),
    // Right-align numbers
    ...(!(rowIndex === 0 || columnIndex === 0) &&
      (type === "number" || type === "integer")
      ? { textAlign: "right" }
      : { textAlign: "left" })
  })
};
