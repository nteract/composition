import React from 'react';
import ReactDOM from 'react-dom';
import Immutable from 'immutable';

import Notebook from './components/Notebook';

require.extensions['.ipynb'] = require.extensions['.json'];
const notebook = require('../test-notebooks/multiples.ipynb');

// Convert the multiline strings from a raw notebook so we have a nice
// consistent structure for Immutable.JS
for(const cell of notebook.cells) {
  if(cell.outputs) {
    for(const output of cell.outputs) {
      if (output.data) {
        for (const mimetype in output.data) {
          if (Array.isArray(output.data[mimetype])) {
            output.data[mimetype] = output.data[mimetype].join('');
          }
        }
      }
    }
  }
}

const immutableNotebook = Immutable.fromJS(notebook);

require('./setupMenu');

ReactDOM.render(
  <Notebook cells={immutableNotebook.get('cells')}
            language={immutableNotebook.getIn(['metadata', 'language_info', 'name'])} />
, document.querySelector('#app'));
