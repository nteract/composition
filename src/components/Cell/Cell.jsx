import React from 'react';

import CodeCell from './CodeCell';
import MarkdownCell from './MarkdownCell';

export default class Cell extends React.Component {
  static displayName = 'Cell';

  static propTypes = {
    channels: React.PropTypes.any,
    index: React.PropTypes.number,
    input: React.PropTypes.any,
    language: React.PropTypes.string,
    notebook: React.PropTypes.any,
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
          index={this.props.index}
          input={this.props.input}
          notebook={this.props.notebook}
        /> :
        <CodeCell
          index={this.props.index}
          input={this.props.input}
          language={this.props.language}
          outputs={this.props.outputs}
          notebook={this.props.notebook}
          channels={this.props.channels}
        />
      }
      </div>
    );
  }
}
