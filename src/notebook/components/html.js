import React from 'react';
import ReactDOM from 'react-dom';

export class HTMLDisplay extends React.Component {
  static propTypes = {
    data: React.PropTypes.string,
  }

  componentDidMount() {
    // Remove the script tags from the HTML repr.  Script tags should be handled
    // by the page level IFrame.  Content must be wrapped in a div in order to
    // parse correctly.
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${this.props.data}</div>`, 'text/xml');
    Array.prototype.forEach.call(doc.querySelectorAll('script'), scriptEl => {
      scriptEl.remove();
    });

    const container = ReactDOM.findDOMNode(this.refs.here);
    Array.prototype.forEach.call(doc.children, child => {
      container.appendChild(child);
    });
  }

  render() {
    return (
      <div ref="here" />
    );
  }
}
