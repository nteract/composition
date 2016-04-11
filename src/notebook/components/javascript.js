import React from 'react';
import ReactDOM from 'react-dom';
import Immutable from 'immutable';

export class Javascript extends React.Component {
  static propTypes = {
    notebook: React.PropTypes.any.isRequired,
    displayOrder: React.PropTypes.instanceOf(Immutable.List).isRequired,
  }

  state = {
    currentJs: null,
  };

  componentDidMount() {
    console.log('remount');
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
      .map(cell => cell.get('outputs').valueSeq())
      .flatten(true)
      .filter(output => output.get('output_type') === 'display_data')
      .map(output => output.get('data', new Immutable.Map()))
      .forEach(bundle => {
        for (i = 0; i < this.props.displayOrder.length; i++) {
          const mimetype = this.props.displayOrder[i];
          console.log('mimetype?', mimetype);
          if (bundle[mimetype]) {
            console.log('- mimetype');
            if (mimetype === 'application/javascript') {
              console.log('js');
              runJS(bundle[mimetype]);
            } else if (mimetype === 'text/html') {
              console.log('html');
              const parser = new DOMParser();
              const doc = parser.parseFromString(`<div>${bundle[mimetype]}</div>`, 'text/xml');
              Array.prototype.forEach.call(doc.querySelectorAll('script'), runScript);
            }
            console.log('done');
            // This was rendered here or elsewhere as a non-JS mimetype
            break;
          }
        }
      }
    );
  }

  render() {
    console.log('render');
    // this.setState({ currentJs: this.props.notebook.get('cellOrder')
    //   .map(id => this.props.notebook.getIn(['cellMap', id]))
    //   .map(cell => cell.get('outputs').valueSeq())
    //   .flatten(true)
    //   .filter(output => output.get('output_type') === 'display_data')
    //   .map(output => output.get('data', new Immutable.Map()))
    //   .map(bundle => bundle.get('application/javascript', '') + bundle.get('text/html', ''))
    //   .join('\n'),
    // });

    // Prevents mixed mode security in IE6/7 by using JS src
    return (
      <div>
        <iframe ref="here" src="javascript:''" style={{ display: 'none' }} />
        { this.props.notebook.get('cellOrder')
            .map(id => this.props.notebook.getIn(['cellMap', id]))
            .map(cell => cell.get('outputs').valueSeq())
            .flatten(true)
            .filter(output => output.get('output_type') === 'display_data')
            .map(output => output.get('data', new Immutable.Map()))
            .map(x => JSON.stringify(x.toJS()))

           }
      </div>
    );
  }
}
