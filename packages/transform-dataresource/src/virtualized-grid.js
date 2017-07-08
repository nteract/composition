/* @flow */
import React from "react";
import { MultiGrid, AutoSizer, ColumnSizer } from "react-virtualized";
import { infer } from "./infer";

type Props = {
  data: Array<Object>,
  schema: { fields: Array<Object> },
  theme?: string,
  width?: number,
  height?: number,
  rowHeight: number,
  maxRows: number,
  columnMinWidth: number,
  columnMaxWidth: number,
  sampleSize: number
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

function inferSchema(
  data: Array<Object>,
  sampleSize: number
): { fields: Array<Object> } {
  const sampleRows = getSampleRows(data, sampleSize);
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
  const schema = props.schema || inferSchema(data, props.sampleSize);
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

  static defaultProps = {
    theme: "light",
    rowHeight: 36,
    maxRows: 10,
    columnMinWidth: 100,
    columnMaxWidth: 300,
    sampleSize: 10
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
        style={styles.cell({
          columnIndex,
          rowIndex,
          style,
          type,
          theme: this.props.theme
        })}
      >
        {value}
      </div>
    );
  };

  render() {
    const rowCount = this.state.data.length;
    const { rowHeight, maxRows } = this.props;
    const maxHeight =
      rowCount * rowHeight > maxRows * rowHeight
        ? maxRows * rowHeight
        : rowCount * rowHeight;
    return (
      <AutoSizer disableHeight>
        {({ width }) =>
          <ColumnSizer
            columnMaxWidth={this.props.columnMaxWidth}
            columnMinWidth={this.props.columnMinWidth}
            columnCount={this.state.schema.fields.length}
            width={width}
          >
            {({ adjustedWidth, getColumnWidth, registerChild }) =>
              <MultiGrid
                ref={registerChild}
                cellRenderer={this.cellRenderer}
                columnCount={this.state.schema.fields.length}
                columnWidth={getColumnWidth}
                fixedColumnCount={1}
                fixedRowCount={1}
                height={this.props.height || maxHeight}
                overscanColumnCount={15}
                overscanRowCount={150}
                rowCount={rowCount}
                rowHeight={rowHeight}
                width={this.props.width || adjustedWidth}
              />}
          </ColumnSizer>}
      </AutoSizer>
    );
  }
}

const styles = {
  cell: ({ columnIndex, rowIndex, style, type, theme }) => ({
    ...style,
    boxSizing: "border-box",
    padding: "0.5em 1em",
    border: theme === "nteract" ? "1px solid #495F7D" : "1px solid #ddd",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    // Remove top border for all cells except first row
    ...(rowIndex !== 0 ? { borderTop: "none" } : {}),
    // Remove left border for all cells except first column
    ...(columnIndex !== 0 ? { borderLeft: "none" } : {}),
    // Highlight even rows
    ...(rowIndex % 2 === 0 && !(rowIndex === 0 || columnIndex === 0)
      ? theme === "nteract"
        ? { background: "rgba(255,255,255,0.075)" }
        : { background: "rgba(0, 0, 0, 0.03)" }
      : {}),
    // Bold the headers
    ...(rowIndex === 0 || columnIndex === 0
      ? theme === "nteract"
        ? {
            background: "rgba(0,0,0,0.25)",
            fontWeight: "bold"
          }
        : {
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
