import React from 'react';
import ReactMarkdown from 'react-markdown';
import { connect } from 'react-redux';

import Editor from './editor';

import { updateCellSource } from '../../actions';

const mapDispatchToProps = {
  updateCellSource
};

export class MarkdownCell extends React.Component {
  static displayName = 'MarkdownCell';

  static propTypes = {
    cell: React.PropTypes.any,
    id: React.PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.state = {
      view: true,
      // HACK: We'll need to handle props and state change better here
      source: this.props.cell.get('source'),
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      source: nextProps.cell.get('source'),
    });
  }

  keyDown(e) {
    if (!e.shiftKey || e.key !== 'Enter') {
      return;
    }
    this.setState({ view: true });
  }

  render() {
    return (
        (this.state && this.state.view) ?
          <div
            className='cell_markdown'
            onDoubleClick={() => this.setState({ view: false }) }>
            <ReactMarkdown source={this.state.source} />
          </div> :
          <div onKeyDown={this.keyDown.bind(this)}>
            <Editor language='markdown'
                    id={this.props.id}
                    input={this.state.source}
                    onChange={
                      (text) => {
                        this.setState({
                          source: text,
                        });
                        this.props.updateCellSource(this.props.id, text);
                      }
                    }/>
          </div>
    );
  }
}

export default connect(null, mapDispatchToProps)(MarkdownCell);
