import React from 'react';

import CodeCell from './CodeCell';
import MarkdownCell from './MarkdownCell';

export default class Cell extends React.Component {
  static displayName = 'Cell';

  static propTypes = {
    input: React.PropTypes.any,
    language: React.PropTypes.string,
    onTextChange: React.PropTypes.func,
    outputs: React.PropTypes.any,
    type: React.PropTypes.string,
  };

  render() {
    return (
      <div style={{
        paddingLeft: '10px',
        paddingRight: '10px',
        paddingBottom: '10px',
      }}>
      {
      this.props.type === 'markdown' ?
        <MarkdownCell
          input={this.props.input}
          onTextChange={this.props.onTextChange}
        /> :
        <CodeCell
          input={this.props.input}
          onTextChange={this.props.onTextChange}
          language={this.props.language}
          outputs={this.props.outputs}
          />
      }
      </div>
    );
  }
}
