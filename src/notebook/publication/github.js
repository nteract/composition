const Rx = require('rxjs/Rx');
const commutable = require('commutable');
const path = require('path');

import { shell } from 'electron';

import {
  doneUploading,
  startedUploading,
  overwriteMetadata,
} from '../actions';

function notifyUser(filename, gistURL, gistID, notificationSystem) {
  notificationSystem.addNotification({
    title: 'Gist uploaded',
    message: `${filename} is ready`,
    dismissible: true,
    position: 'tr',
    level: 'success',
    action: {
      label: 'Open Gist',
      callback: function openGist() {
        shell.openExternal(`https://nbviewer.jupyter.org/${gistID}`);
      },
    },
  });
}

function createGistCallback(hotOffThePresses, agenda, filename, notificationSystem) {
  return function gistCallback(err, response) {
    if (err) {
      agenda.error(err);
      agenda.complete();
      return;
    }

    const gistID = response.id;
    const gistURL = response.html_url;

    notifyUser(filename, gistURL, gistID, notificationSystem);
    if (hotOffThePresses) {
      agenda.next(overwriteMetadata('gist_id', gistID));
    }
    agenda.next(doneUploading);
  };
}

export function publish(github, notebook, filepath, notificationSystem) {
  return Rx.Observable.create((agenda) => {
    const notebookString = JSON.stringify(commutable.toJS(notebook), undefined, 1);

    let filename;

    if (filepath) {
      filename = path.parse(filepath).base;
    } else {
      filename = 'Untitled.ipynb';
    }

    const files = {};
    files[filename] = { content: notebookString };

    agenda.next(startedUploading);

    // Already in a gist, update the gist
    if (notebook.hasIn(['metadata', 'gist_id'])) {
      const gistRequest = {
        files,
        id: notebook.getIn(['metadata', 'gist_id']),
      };
      github.gists.edit(gistRequest,
        createGistCallback(false, agenda, filename, notificationSystem));
    } else {
      const gistRequest = {
        files,
        public: false,
      };
      github.gists.create(gistRequest,
        createGistCallback(true, agenda, filename, notificationSystem));
    }
  });
}
