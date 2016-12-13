/* @flow */
/* eslint class-methods-use-this: 0 */
import React, { PropTypes } from 'react';

import { Map as ImmutableMap } from 'immutable';


import { Table, Column, Cell } from 'fixed-data-table';

type Props = {
  data: ImmutableMap,
};

const MIMETYPE = 'application/vnd.tableschema.v1+json';

export class TableTransform extends React.Component {
  props: Props;

  static MIMETYPE = MIMETYPE;

  shouldComponentUpdate(nextProps: Props): boolean {
    return this.props.data !== nextProps.data;
  }

  render(): ?React.Element<any> {
    const { data, schema } = this.props.data.toJS();

    return (
      // fixed-data-table/dist/fixed-data-table.min.css
      // node_modules/fixed-data-table/dist/fixed-data-table.min.css
      <div>
        <link
          rel="stylesheet"
          href={'../node_modules/fixed-data-table/dist/fixed-data-table.min.css'}
        />
        <Table
          rowHeight={50}
          headerHeight={50}
          rowsCount={data.length}
          width={3000}
          height={2000}
          {...this.props}
        >
          {
            schema.fields.map((field, idx) =>
              <Column
                header={<Cell>{field.name}</Cell>}
                cell={(props) =>
                  <Cell>{data[props.rowIndex][field.name]}</Cell>
                }
                width={300}
                key={idx}
                fixed={false}
              />
            )
          }

        </Table>
      </div>
    );
  }

}

export default TableTransform;
