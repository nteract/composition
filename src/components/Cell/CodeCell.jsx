import React from 'react';

import Editor from './Editor';
import Display from 'react-jupyter-display-area';

export default class CodeCell extends React.Component {
  static displayName = 'CodeCell';

  static propTypes = {
    channels: React.PropTypes.any,
    input: React.PropTypes.any,
    language: React.PropTypes.string,
    outputs: React.PropTypes.any,
    theme: React.PropTypes.string,
  };

  render() {
    return (
      <div>
        <Editor {...this.props} />
        <Display {...this.props} />
      </div>
    );
  }
}
