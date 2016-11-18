/* @flow */
/* eslint class-methods-use-this: 0 */
import React, { PropTypes } from 'react';

type Props = {
  data: Object,
};

const objectToReact = require('reon-core/lib/object-to-react');

const MIMETYPE = 'application/vnd.nteract.react.v1+json';

class REONTransform extends React.Component {
  props: Props;

  static MIMETYPE = MIMETYPE;

  render(): ?React.Element<any> {
    try {
      return objectToReact(this.props.data.toJS());
    } catch(err) {
      console.error(err);
      return (
        <code>{JSON.stringify(err, 2, 2)}</code>
      );
    }
  }
}

export default REONTransform;
