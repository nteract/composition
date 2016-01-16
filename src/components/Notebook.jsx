import React from 'react';

import Cell from './Cell';

export default class Notebook extends React.Component {
  static displayName = 'Notebook';

  static propTypes = {
    language: React.PropTypes.string,
    notebook: React.PropTypes.any,
  };

  componentWillMount() {
    const lang = this.props.notebook.getIn(['metadata', 'language_info', 'name']);
    // HACK: This should give you the heeby-jeebies
    // Mostly because lang could be ../../../../whatever
    // This is the notebook though, so hands off
    // We'll want to check for this existing later
    // and any other validation
    require('codemirror/mode/' + lang + '/' + lang);
    // Assume markdown should be required
    require('codemirror/mode/markdown/markdown');
  }

  render() {
    const cells = this.props.notebook.get('cells');
    return (
      <div style={{
        paddingTop: '10px',
        paddingLeft: '10px',
        paddingRight: '10px',
      }} ref='cells'>

      {
        cells.map((cell, index) => {
          return <Cell input={cell.get('source')}
                       language={this.props.language}
                       outputs={cell.get('outputs')}
                       type={cell.get('cell_type')}
                       key={index}
                       />;
        })
      }
      </div>
    );
  }
}
