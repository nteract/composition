import React from 'react';
import ReactDOM from 'react-dom';

export default class IFrame extends React.Component {
  static propTypes = {
    setIframe: React.PropTypes.function,
  }

  componentDidMount() {
    // const iframe = ReactDOM.findDOMNode(this.refs.here);
  }

  render() {
    return (
      // Prevents mixed mode security in IE6/7 by using JS src
      <iframe ref="here" src="javascript:''" style={{ display: 'none' }}/> // eslint-disable-line
    );
  }
}
