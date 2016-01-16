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

function updateCell(notebook, index, cell) {
  const newNotebook = notebook.setIn(['cells', index], cell);
  renderNotebook(newNotebook);
}

function renderNotebook(notebook) {
  ReactDOM.render(
    <Notebook notebook={notebook}
      onCellChange={(index, cell) => updateCell(notebook, index, cell)} />
    , document.querySelector('#app'));
}

readJSON('./test-notebooks/multiples.ipynb')
  .then((notebook) => {
    const immutableNotebook = commutable.fromJS(notebook);
    renderNotebook(immutableNotebook);
  }).catch(err => {
    ReactDOM.render(
      <pre>{err.toString()}</pre>
      , document.querySelector('#app'));
  });
