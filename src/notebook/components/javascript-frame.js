import React from 'react';
import ReactDOM from 'react-dom';
import Immutable from 'immutable';
import Frame from 'react-frame-component';
import { HTMLScriptsDisplay } from './html-scripts';
import { transforms } from 'transformime-react';

export class JavascriptFrame extends React.Component {
  static propTypes = {
    notebook: React.PropTypes.any.isRequired,
    displayOrder: React.PropTypes.instanceOf(Immutable.List).isRequired,
  }

  render() {
    const Javascript = transforms['application/javascript'];
    const outputs = this.props.notebook.get('cellOrder')
      .map(id => this.props.notebook.getIn(['cellMap', id]))
      .map(cell => cell.get('outputs').valueSeq())
      .flatten(true)
      .filter(output => output.get('output_type') === 'display_data')
      .map(output => output.get('data', new Immutable.Map()))
      .map(bundle => {
        if (bundle.get('application/javascript')) {
          return <Javascript data={ bundle.get('application/javascript') } />;
        } else if (bundle.get('text/html')) {
          return <HTMLScriptsDisplay data={ bundle.get('text/html') } />;
        }
        return null;
      })
      .filter(comp => comp !== null);

    return (<div className="document-javascript"><Frame>
      { outputs }
    </Frame></div>);
  }
}
