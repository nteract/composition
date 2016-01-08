import React from 'react';
import ReactDOM from 'react-dom';

import * as commutable from 'commutable';

import Notebook from './components/Notebook';

require.extensions['.ipynb'] = require.extensions['.json'];
const notebook = require('../test-notebooks/multiples.ipynb');
const immutableNotebook = commutable.fromJS(notebook);

require('./setupMenu');

ReactDOM.render(
  <Notebook cells={immutableNotebook.get('cells')}
            language={immutableNotebook.getIn(['metadata', 'language_info', 'name'])} />
, document.querySelector('#app'));
