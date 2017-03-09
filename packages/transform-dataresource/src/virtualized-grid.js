/* @flow */
import React from 'react';
import {
  MultiGrid,
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache
} from 'react-virtualized';
// import 'react-virtualized/styles.css';
import { infer } from 'jsontableschema';
// import './index.css';


const ROW_HEIGHT = 36;
const GRID_MAX_HEIGHT = 360;
const cache = new CellMeasurerCache({
  defaultWidth: 100,
  minWidth: 75,
  fixedHeight: true
});

type Props = {
  data: Object,
  schema: { fields: Array<Object> },
};

function inferSchema(data) {
  // Take a sampling of rows from data
  const range = Array.from({ length: 10 }, () =>
    Math.floor(Math.random() * data.length)
  );
  // Separate headers and values
  const headers = Array.from(
      range.reduce(
      (result, row) => new Set([...result, ...Object.keys(data[row])]),
      new Set()
    )
  );
  const values = range.map(row => Object.values(data[row]));
  // Infer column types and return schema for data
  return infer(headers, values);
}

export default class VirtualizedGrid extends React.Component {
  props: Props

  componentWillMount() {
    this.data = this.props.data;
    this.schema = this.props.schema || inferSchema(this.props.data);
  }

  componentWillReceiveProps(nextProps: Props) {
    this.data = nextProps.data;
    this.schema = nextProps.schema || inferSchema(nextProps.data);
  }

  data = [];
  schema = { fields: [] };

  cellRenderer = ({ columnIndex, key, parent, rowIndex, style } :
  { columnIndex: number, key: string, parent: mixed, rowIndex: number, style: Object}) => (
    <CellMeasurer
      cache={cache}
      columnIndex={columnIndex}
      key={key}
      parent={parent}
      rowIndex={rowIndex}
    >
      <div
        key={key}
        className={rowIndex === 0 || columnIndex === 0
          ? 'th'
          : 'td'
        }
        style={{
          ...style,
          ...this.props.theme === 'nteract' && rowIndex % 2 === 0 && !(rowIndex === 0 || columnIndex === 0)
            ? { background: 'rgba(255,255,255,0.075)' }
            : {},
          borderCollapse: 'collapse',
          boxSizing: 'border-box'
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
    </CellMeasurer>
    );

  render() {
    const rowCount = this.data.length + 1;
    const height = rowCount * ROW_HEIGHT;
    return (
      <AutoSizer disableHeight>
        {({ width }) => (
          <MultiGrid
            cellRenderer={this.cellRenderer}
            columnCount={this.schema.fields.length}
            columnWidth={index => cache.columnWidth(index) + 15}
            deferredMeasurementCache={cache}
            fixedColumnCount={1}
            fixedRowCount={1}
            height={height < GRID_MAX_HEIGHT ? height : GRID_MAX_HEIGHT}
            rowCount={rowCount}
            rowHeight={ROW_HEIGHT}
            width={width}
          />
        )}
      </AutoSizer>
    );
  }
}
