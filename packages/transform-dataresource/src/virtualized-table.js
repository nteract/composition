/* @flow */
/* eslint no-confusing-arrow: 0 */
/* eslint no-nested-ternary: 0 */
import React from "react";
import { Table, Column, SortDirection, AutoSizer } from "react-virtualized";
import { infer } from "./infer";

const _sortBy = require("lodash").sortBy;

const ROW_HEIGHT = 36;
const COLLAPSED_HEIGHT = ROW_HEIGHT * 10;
const EXPANDED_HEIGHT =
  ROW_HEIGHT * Math.floor((window.innerHeight - 30) / ROW_HEIGHT);

type Props = {
  data: Array<Object>,
  schema: { fields: Array<Object> },
  theme: string,
  expanded: boolean
};

type State = {
  data: Array<Object>,
  schema: { fields: Array<Object> },
  sortBy: string,
  sortDirection: string
};

function inferSchema(data: Array<Object>): { fields: Array<Object> } {
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

export default class VirtualizedTable extends React.Component<Props, State> {
  state: State = {
    data: [],
    schema: { fields: [] },
    sortBy: "",
    sortDirection: SortDirection.ASC
  };

  componentWillMount() {
    const data = this.props.data;
    const schema = this.props.schema || inferSchema(this.props.data);
    this.setState({ data, schema });
  }

  componentWillReceiveProps(nextProps: Props) {
    const data = nextProps.data;
    const schema = nextProps.schema || inferSchema(nextProps.data);
    this.setState({ data, schema });
  }

  sort = ({ sortBy, sortDirection }: State) => {
    const data = _sortBy(this.props.data, [sortBy]);
    this.state.data =
      sortDirection === SortDirection.DESC ? data.reverse() : data;
    this.setState({ sortBy, sortDirection });
  };

  render() {
    const rowCount = this.state.data.length;
    const height = rowCount * ROW_HEIGHT;
    return (
      <AutoSizer disableHeight>
        {({ width }) =>
          <Table
            // ref={ref => this.ref = ref}
            className="table"
            // disableHeader={disableHeader}
            // headerClassName="th"
            headerHeight={ROW_HEIGHT}
            // headerStyle={{
            //   fontWeight: 600,
            //   textAlign: 'right',
            //   // border: '1px solid #ddd',
            //   // padding: '6px 13px'
            //   textTransform: 'none',
            //   outline: 0
            // }}
            height={
              this.props.expanded
                ? EXPANDED_HEIGHT
                : height < COLLAPSED_HEIGHT ? height : COLLAPSED_HEIGHT
            }
            // noRowsRenderer={this._noRowsRenderer}
            // overscanRowCount={overscanRowCount}
            rowClassName={({ index }) => (index === -1 ? "th" : "tr")}
            rowHeight={ROW_HEIGHT}
            rowGetter={({ index }) => this.state.data[index]}
            rowCount={rowCount}
            rowStyle={{
              padding: 0,
              border: "none"
            }}
            // scrollToIndex={scrollToIndex}
            sort={this.sort}
            sortBy={this.state.sortBy}
            sortDirection={this.state.sortDirection}
            // style={{
            //   borderCollapse: 'collapse',
            //   boxSizing: 'border-box'
            // }}
            width={width}
          >
            {this.state.schema.fields.map((field, fieldIndex) =>
              <Column
                key={fieldIndex}
                label={`${field.name}`}
                // cellDataGetter={({ columnData, dataKey, rowData }) =>
                //   rowData
                // }
                dataKey={field.name}
                // disableSort={!this._isSortEnabled()}
                width={150}
                flexGrow={1}
                flexShrink={1}
              />
            )}
          </Table>}
      </AutoSizer>
    );
  }
}
