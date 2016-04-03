import React from 'react';
import ReactDOM from 'react-dom';

export default class HTMLDisplay extends React.Component {
  static propTypes = {
    data: React.PropTypes.string,
  }

  componentDidMount() {
    // Remove the script tags from the HTML repr.  Script tags should be handled
    // by the page level IFrame.
    const parser = new DOMParser();
    const el = parser.parseFromString(this.props.data, 'text/xml');
    Array.prototype.forEach.call(el.querySelectorAll('script'), scriptEl => {
      scriptEl.remove();
    });
    console.log('inserting...', el);
    ReactDOM.findDOMNode(this.refs.here).appendChild(el);
  }

  render() {
    return (
      <div ref="here" />
    );
  }
}
