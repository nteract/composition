import React from 'react';

import Editor from './Editor';
import Display from 'react-jupyter-display-area';

export default class CodeCell extends React.Component {
  static displayName = 'CodeCell';

  static propTypes = {
    input: React.PropTypes.any,
    language: React.PropTypes.string,
    onTextChange: React.PropTypes.func,
    outputs: React.PropTypes.any,
    theme: React.PropTypes.string,
  };

  render() {
    return (
      <div>
        <Editor language={this.props.language}
                text={this.props.input}
                onChange={this.props.onTextChange}
          />
        <Display outputs={this.props.outputs} />
      </div>
    );
  }
}
