import React from 'react';
import ReactDOM from 'react-dom';
import Immutable from 'immutable';

export class IFrame extends React.Component {
  static propTypes = {
    notebook: React.PropTypes.any.isRequired,
    displayOrder: React.PropTypes.instanceOf(Immutable.List).isRequired,
  }

  componentDidMount() {
    // TODO: I'm not sure what the best thing to do here is.  Unfortunately this
    // causes re-execution of all document level Javascript.
    const iframe = ReactDOM.findDOMNode(this.refs.here);
    function runJS(js) {
      const script = iframe.contentWindow.document.createElement('script');
      iframe.contentWindow.document.appendChild(script);
      script.textContent = js;
    }
    function runScript(scriptEl) {
      iframe.contentWindow.document.appendChild(scriptEl);
    }

    let i = 0;
    this.props.notebook.get('cellOrder')
      .map(id => this.props.notebook.getIn(['cellMap', id]))
      .map(cell => cell.get('outputs'))
      .flatten()
      .forEach(output => {
        const outputType = output.get('output_type');
        if (outputType === 'display_data') {
          const bundle = output.get('data');
          for (i = 0; i < this.props.displayOrder.length; i++) {
            const mimetype = this.props.displayOrder[i];
            if (bundle[mimetype]) {
              if (mimetype === 'application/javascript') {
                runJS(bundle[mimetype]);
              } else if (mimetype === 'text/html') {
                const parser = new DOMParser();
                const doc = parser.parseFromString(`<div>${bundle[mimetype]}</div>`, 'text/xml');
                Array.prototype.forEach.call(doc.querySelectorAll('script'), runScript);
              }
              // This was rendered here or elsewhere as a non-JS mimetype
              break;
            }
          }
        }
      });
  }

  render() {
    return (
      // Prevents mixed mode security in IE6/7 by using JS src
      <iframe ref="here" src="javascript:''" style={{ display: 'none' }} /> // eslint-disable-line
    );
  }
}
