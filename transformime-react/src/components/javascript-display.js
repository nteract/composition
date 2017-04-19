import React from 'react';
import ReactDOM from 'react-dom';

export default class HTMLDisplay extends React.Component {
  static propTypes = {
    data: React.PropTypes.string,
  }

  componentDidMount() {
    if (this.refs.here) {
      try {
        // Compatibility with Jupyter/notebook JS evaluation.  Set element so
        // the user has a handle on the context of the current output.
        const element = ReactDOM.findDOMNode(this.refs.here); // eslint-disable-line
        eval(this.props.data); // eslint-disable-line
      } catch (err) {
        console.error('Could not execute user Javascript', err); //eslint-disable-line
      }
    }
  }

  render() {
    return (
      <div ref="here" />
    );
  }
}
