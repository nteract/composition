import React from 'react';
import ReactDOM from 'react-dom';

import fs from 'fs';

import * as commutable from 'commutable';

import Notebook from './components/Notebook';

function readJSON(filepath) {
  return new Promise((resolve, reject) => {
    return fs.readFile(filepath, {}, (err, data) => {
      if(err) {
        reject(err);
        return;
      }
      try {
        const nb = JSON.parse(data);
        resolve(nb);
        return;
      }
      catch (e) {
        reject(e);
      }
    });
  });
}

readJSON('./test-notebooks/multiples.ipynb')
  .then((notebook) => {
    const immutableNotebook = commutable.fromJS(notebook);
    ReactDOM.render(
      <Notebook notebook={immutableNotebook} />
    , document.querySelector('#app'));
  }).catch(err => {
    ReactDOM.render(
      <pre>{err.toString()}</pre>
      , document.querySelector('#app'));
  });
