/* @flow */
import React from 'react';
import { MultiGrid, AutoSizer } from 'react-virtualized';
// import 'react-virtualized/styles.css';
import { infer } from 'jsontableschema';
// import './index.css';

const ROW_HEIGHT = 36;
const COLUMN_WIDTH = 144;
const GRID_MAX_HEIGHT = ROW_HEIGHT * 10;
// The width per text character for calculating widths for columns
const COLUMN_CHARACTER_WIDTH = 7;
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
  schema: { fields: Array<Object> },
  columnWidths: Array<number>
};

function getSampleRows(data: Array<Object>, sampleSize: number): Array<Object> {
  return Array.from({ length: sampleSize }, () => {
    const index = Math.floor(Math.random() * data.length);
    return data[index];
  });
}

function inferSchema(data: Array<Object>): { fields: Array<Object> } {
  // Take a sampling of rows from data
  const sampleRows = getSampleRows(data, SAMPLE_SIZE);
  // Separate headers and values
  const headers = Array.from(
    sampleRows.reduce(
      (result, row) => new Set([...result, ...Object.keys(row)]),
      new Set()
    )
  );
  const values = sampleRows.map(row => Object.values(row));
  // Infer column types and return schema for data
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
  const columnWidths = columns.map(column => {
    const sampleRows = getSampleRows(data, SAMPLE_SIZE);
    return sampleRows.reduce(
      (result, row) =>
        `${row[column]}`.length > result ? `${row[column]}`.length : result,
      Math.ceil(COLUMN_WIDTH / COLUMN_CHARACTER_WIDTH)
    );
  });
  return {
    data: [headers, ...data],
    schema,
    columnWidths
  };
}

export default class VirtualizedGrid extends React.Component {
  props: Props;
  state: State = {
    data: [],
    schema: { fields: [] },
    columnWidths: []
  };

  componentWillMount() {
    const state = getState(this.props);
    this.setState(state);
  }

  componentWillReceiveProps(nextProps: Props) {
    const state = getState(nextProps);
    this.setState(state);
  }

  cellRenderer = (
    {
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
    }
  ) => {
    const { name: column, type } = this.state.schema.fields[columnIndex];
    const value = this.state.data[rowIndex][column];
    return (
      <div
        key={key}
        className={rowIndex === 0 || columnIndex === 0 ? 'th' : 'td'}
        style={{
          ...style,
          boxSizing: 'border-box',
          borderTop: 'none',
          borderLeft: 'none',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          // Highlight even rows
          ...(this.props.theme === 'nteract' &&
            rowIndex % 2 === 0 &&
            !(rowIndex === 0 || columnIndex === 0)
            ? { background: 'rgba(255,255,255,0.075)' }
            : {}),
          // Bold the headers
          ...(rowIndex === 0 || columnIndex === 0
            ? { fontWeight: 'bold' }
            : {}),
          // Right-align numbers
          ...(!(rowIndex === 0 || columnIndex === 0) &&
            (type === 'number' || type === 'integer')
            ? { textAlign: 'right' }
            : { textAlign: 'left' })
        }}
      >
        {value}
      </div>
    );
  };

  render() {
    const rowCount = this.state.data.length;
    const height = rowCount * ROW_HEIGHT;
    return (
      <AutoSizer disableHeight>
        {({ width }) => (
          <MultiGrid
            cellRenderer={this.cellRenderer}
            columnCount={this.state.schema.fields.length}
            columnWidth={({ index }) =>
              this.state.columnWidths[index] * COLUMN_CHARACTER_WIDTH ||
              COLUMN_WIDTH}
            fixedColumnCount={1}
            fixedRowCount={1}
            height={height < GRID_MAX_HEIGHT ? height : GRID_MAX_HEIGHT}
            rowCount={rowCount}
            rowHeight={ROW_HEIGHT}
            style={{
              border: '1px solid var(--primary-border)'
            }}
            width={width}
          />
        )}
      </AutoSizer>
    );
  }
}
