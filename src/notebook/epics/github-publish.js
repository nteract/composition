import { shell } from 'electron';

import {
  overwriteMetadata,
} from '../actions';

import {
  SET_GITHUB,
} from '../constants';

const commutable = require('commutable');
const path = require('path');

const Rx = require('rxjs/Rx');

const Observable = Rx.Observable;

const Github = require('github');

/**
 * In order to use authentication, you must go to your github settings >>
 * personal access tokens >> generate new token >> generate a token
 * with gist permissions. Then, when starting nteract, pass your token by
 * entering GITHUB_TOKEN=long_string_here npm run start in the command
 * line.
 */

/**
 * Create an observable stream containing the Github API
 * @param {object} authOptions - The authorization information, right now
 * this is just oauth token and corresponding type, but can be username
 * and password later, https://developer.github.com/v3/#authentication
 */
export const githubAuthObservable = () =>
  Observable.create(observer => {
    const github = new Github();
    if (process.env.GITHUB_TOKEN) {
      github.authenticate({ type: 'oauth', token: process.env.GITHUB_TOKEN });
    }
    observer.next(github);
    observer.complete();
  });

/**
 * setGithub is an action creator for redux, creates a plain object to be
 * merged into the state tree.
 * @param {object} github - Node-github object for using the Github API.
 * @return plain object for merging into redux state tree.
 */
export const setGithub = (github) => ({
  type: SET_GITHUB,
  github,
});

export const PUBLISH_GIST = 'PUBLISH_GIST';

/**
 * Return an observer that handles authorization.
 * @return Observer containing oauth token.
 */
export const initialGitHubAuthEpic = function foo() {
  return githubAuthObservable()
    .catch(err => {
      // TODO: Prompt?
      // Leaving this here in case authentication becomes more complicated.
      console.error(err);
      return new Github(); // Fall back to no auth
    })
    .map(setGithub);
};

/**
 * Notify the notebook user that it has been published as a gist.
 * @param {string} filename - Filename of the notebook.
 * @param {string} gistURL - URL for the published gist.
 * @param {string} gistID - ID of the published gist, given after URL
 * @param {object} notificationSystem - To be passed information for
 * notification of the user that the gist has been published.
 */
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

/**
 * Callback function to be used in publishNotebookObservable such that the
 * response from the github API can be used for user notification.
 * @param {boolean} firstTimePublish - If false, overwrite gist_id metdata.
 * @param {object} observer - The publishNotebookObserver that will be
 * completed after the callback.
 * @param {string} filename - Filename of the notebook.
 * @param {function} notificationSystem - To be passed information for
 * notification of the user that the gist has been published.
 * @return callbackFunction for use in publishNotebookObservable
 */
export function createGistCallback(firstTimePublish, observer, filename, notificationSystem) {
  return function gistCallback(err, response) {
    if (err) {
      observer.error(err);
      observer.complete();
      return;
    }
    const gistID = response.id;
    const gistURL = response.html_url;

    notifyUser(filename, gistURL, gistID, notificationSystem);
    if (firstTimePublish) {
      // TODO: Move this up and out to be handled as a return on the observable
      observer.next(overwriteMetadata('gist_id', gistID));
    }
  };
}

/**
 * Notebook Observable for the purpose of tracking every time a user
 * wishes to publish a gist.
 * @param {object} github - The github api for authenticating and publishing
 * the gist.
 * @param {object} notebook - The notebook to be converted to its JSON.
 * @param {string} filename - The filename of the notebook to be published.
 * @param {function} notificationSystem - To be passed information for
 * notification of the user that the gist has been published.
 */
export function publishNotebookObservable(github, notebook, filepath, notificationSystem) {
  return Rx.Observable.create((observer) => {
    const notebookString = JSON.stringify(
      commutable.toJS(notebook.update('cellMap', cells =>
        cells.map(value =>
          value.delete('inputHidden').delete('outputHidden').delete('status')))),
      undefined,
      1);

    let filename;

    if (filepath) {
      filename = path.parse(filepath).base;
    } else {
      filename = 'Untitled.ipynb';
    }

    const files = {};
    files[filename] = { content: notebookString };

    notificationSystem.addNotification({
      title: 'Uploading gist...',
      message: 'Your notebook is being uploaded as a GitHub gist',
      level: 'info',
    });

    // Already in a gist, update the gist
    if (notebook.hasIn(['metadata', 'gist_id'])) {
      const gistRequest = {
        files,
        id: notebook.getIn(['metadata', 'gist_id']),
      };
      github.gists.edit(gistRequest,
        createGistCallback(false, observer, filename, notificationSystem));
    } else {
      const gistRequest = {
        files,
        public: false,
      };
      github.gists.create(gistRequest,
        createGistCallback(true, observer, filename, notificationSystem));
    }
  });
}

/**
 * Epic to capture the end to end action of publishing and receiving the
 * response from the Github API.
 */
export const publishEpic = (action$, store) =>
  action$.ofType(PUBLISH_GIST)
    .mergeMap(() => {
      // TODO: Determine if action should have the notebook or if it should be pulled from store
      const state = store.getState();
      const notebook = state.document.get('notebook');
      const filename = state.metadata.get('filename');
      const github = state.app.get('github');
      const notificationSystem = state.app.get('notificationSystem');

      return publishNotebookObservable(github, notebook, filename, notificationSystem);
    })
    .catch((err) => {
      const state = store.getState();
      const notificationSystem = state.app.get('notificationSystem');
      // TODO: Let this go into the general error flow
      if (err.message) {
        const githubError = JSON.parse(err.message);
        if (githubError.message === 'Bad credentials') {
          notificationSystem.addNotification({
            title: 'Bad credentials',
            message: 'Unable to authenticate with your credentials.\n' +
                     'What do you have $GITHUB_TOKEN set to?',
            level: 'error',
          });
          return;
        }
        notificationSystem.addNotification({
          title: 'Publication Error',
          message: githubError.message,
          level: 'error',
        });
        return;
      }
      notificationSystem.addNotification({
        title: 'Unknown Publication Error',
        message: err.toString(),
        level: 'error',
      });
    });
