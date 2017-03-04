import React from "react";
import { Grid, MultiGrid, AutoSizer, CellMeasurer } from "react-virtualized";
// import 'react-virtualized/styles.css';
import { infer } from "jsontableschema";
// import './index.css';

const ROW_HEIGHT = 34;

function inferSchema(data) {
  const headers = data.reduce(
    (result, row) => [...new Set([...result, ...Object.keys(row)])],
    []
  );
  const values = data.map(row => Object.values(row));
  return infer(headers, values);
}

export default class VirtualizedGrid extends React.Component {
  data = [];
  schema = { fields: [] };

  componentWillMount() {
    this.data = this.props.data;
    this.schema = this.props.schema || inferSchema(this.props.data);
  }
  componentWillReceiveProps(nextProps) {
    this.data = nextProps.data;
    this.schema = nextProps.schema || inferSchema(nextProps.data);
  }

  render() {
    return (
      <AutoSizer disableHeight>
        {({ width }) => (
          <CellMeasurer
            cellRenderer={this.cellRenderer}
            columnCount={this.schema.fields.length}
            height={ROW_HEIGHT}
            rowCount={this.data.length + 1}
          >
            {({ getColumnWidth }) => (
              <MultiGrid
                cellRenderer={this.cellRenderer}
                columnCount={this.schema.fields.length}
                columnWidth={getColumnWidth}
                fixedRowCount={1}
                height={
                  (this.data.length + 1) * (ROW_HEIGHT + 8) < 400
                    ? (this.data.length + 1) * (ROW_HEIGHT + 8)
                    : 400
                }
                rowCount={this.data.length + 1}
                rowHeight={ROW_HEIGHT}
                width={width}
              />
            )}
          </CellMeasurer>
        )}
      </AutoSizer>
    );
  }

  cellRenderer = ({ columnIndex, key, rowIndex, style }) => {
    return (
      <div
        key={key}
        style={{
          ...style,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
          fontSize: 16,
          fontWeight: rowIndex === 0 ? 600 : "normal",
          backgroundColor: rowIndex % 2 === 0 && rowIndex !== 0
            ? "#f8f8f8"
            : "#fff",
          border: "1px solid #ddd",
          padding: "6px 13px"
        }}
      >
        {
          [
            this.schema.fields.reduce(
              (result, field) => ({ ...result, [field.name]: field.name }),
              {}
            ),
            ...this.data
          ][rowIndex][this.schema.fields[columnIndex].name]
        }
      </div>
    );
  };
}
