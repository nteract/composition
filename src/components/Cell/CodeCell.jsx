import React from 'react';

import Editor from './Editor';
import Display from 'react-jupyter-display-area';

import { updateCell } from '../../actions';

import { createExecuteRequest } from '../../api/messaging';

const Rx = require('@reactivex/rxjs');

function isChildMessage(msg) {
  return this.header.msg_id === msg.parent_header.msg_id;
}

export default class CodeCell extends React.Component {
  static displayName = 'CodeCell';

  static propTypes = {
    channels: React.PropTypes.any,
    index: React.PropTypes.number,
    input: React.PropTypes.any,
    language: React.PropTypes.string,
    notebook: React.PropTypes.object,
    outputs: React.PropTypes.any,
    theme: React.PropTypes.string,
  };

  static contextTypes = {
    dispatch: React.PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {
      view: true,
      // HACK: We'll need to handle props and state change better here
      source: this.props.input,
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      source: nextProps.input,
    });
  }

  keyDown(e) {
    if (!e.shiftKey || e.key !== 'Enter') {
      return;
    }
    if(!this.props.channels) {
      return;
    }

    const { iopub, shell } = this.props.channels;
    shell.subscribe((msg) => console.log(msg));

    const executeRequest = createExecuteRequest(this.state.source);

    const childMessages = iopub.filter(isChildMessage.bind(executeRequest))
      .publish()
      .refCount();

    const oldOutputs = this.props.outputs;
    console.log(oldOutputs.toJS());

    const displayData = childMessages
      .filter(msg => msg.header.msg_type === 'display_data')
      .map(msg => {
        return {
          data: msg.content,
          metadata: {},
          output_type: msg.header.msg_type, // eslint-disable-line camelcase
        };
      });

     const executeResult = childMessages
       .filter(msg => msg.header.msg_type === 'execute_result')
       .map(msg => msg.content);

     const executeInput = childMessages
       .filter(msg => msg.header.msg_type === 'execute_input')
       .map(msg => msg.content);

     const executeReply = childMessages
       .filter(msg => msg.header.msg_type === 'execute_reply')
       .map(msg => msg.content);

     const status = childMessages
       .filter(msg => msg.header.msg_type === 'status')
       .map(msg => msg.content.execution_state);

     const streamReply = childMessages
       .filter(msg => msg.header.msg_type === 'stream')
       .map(msg => msg.content);

     const errorReplies = childMessages
       .filter(msg => msg.header.msg_type === 'error')
       .map(msg => msg.content);

     const errorStream = Rx.Observable
       .merge(errorReplies, executeReply.filter(x => x.status === 'error'));

    executeReply.subscribe((msg) => {
      console.log(msg);
    });

    displayData.subscribe((msg) => {
      console.log(msg);
    });

    // Run code
    shell.next(executeRequest);

    // TODO: Don't insert a newline
  }

  render() {
    return (
      <div>
        <div onKeyDown={this.keyDown.bind(this)}>
          <Editor
            language={this.props.language}
            index={this.props.index}
            input={this.state.source}
            notebook={this.props.notebook}
            onChange={
              (text) => {
                this.setState({
                  source: text,
                });
                this.context.dispatch(updateCell(this.props.notebook, this.props.index, text));
              }
            }
          />
        </div>
        <Display {...this.props} />
      </div>
    );
  }
}
