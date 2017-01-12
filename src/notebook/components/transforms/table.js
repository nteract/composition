/* @flow */
/* eslint class-methods-use-this: 0 */
import React, { PropTypes } from 'react';

import { Map as ImmutableMap } from 'immutable';

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
      <table border="1" className="dataframe" width="100%">
        <thead>
          <tr style={{ textAlign: 'right' }}>
            {
              schema.fields.map((field, idx) => (
                <th key={idx}>{field.name}</th>
              ))
            }
          </tr>
        </thead>
        <tbody>
          {
            data.map((row, rowIndex) =>
              <tr key={rowIndex}>
                {
                  schema.fields.map((field, idx) => (
                    <td>{row[field.name]}</td>
                  ))
                }
              </tr>
            )
          }
        </tbody>
      </table>
    );
  }

}

export default TableTransform;
