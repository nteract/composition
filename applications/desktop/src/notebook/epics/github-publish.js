// @flow
import { shell } from "electron";

import {
  selectors,
  actions,
  actionTypes,
  state as stateModule
} from "@nteract/core";

const path = require("path");

import type { Observer } from "rxjs/Observer";
import type { ActionsObservable } from "redux-observable";

import { Observable } from "rxjs/Observable";
import { of } from "rxjs/observable/of";

import { empty } from "rxjs/observable/empty";

import { mergeMap, catchError } from "rxjs/operators";
import { ofType } from "redux-observable";

const Github = require("@octokit/rest");

/**
 * Notify the notebook user that it has been published as a gist.
 * @param {string} filename - Filename of the notebook.
 * @param {string} gistID - ID of the published gist, given after URL
 * @param {object} notificationSystem - To be passed information for
 * notification of the user that the gist has been published.
 */
export function notifyUser(
  filename: string,
  gistID: string,
  notificationSystem: any
) {
  notificationSystem.addNotification({
    title: "Gist uploaded",
    message: `${filename} is ready`,
    dismissible: true,
    position: "tr",
    level: "success",
    action: {
      label: "Open Gist",
      callback: function openGist() {
        shell.openExternal(`https://nbviewer.jupyter.org/${gistID}`);
      }
    }
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
export function createGistCallback(
  observer: Observer<*>,
  filename: string,
  notificationSystem: any,
  contentRef: stateModule.ContentRef
) {
  return function gistCallback(err: Error, response: any) {
    if (err) {
      observer.error(err);
      observer.complete();
      return;
    }
    const gistID = response.data.id;
    observer.next(
      actions.overwriteMetadataField({
        field: "gist_id",
        value: gistID,
        contentRef
      })
    );
    notifyUser(filename, gistID, notificationSystem);
    observer.complete();
  };
}

/**
 * Handle gist errors for the publish epic.
 * @param  {String} error - Error response to be parsed and handled.
 *
 */
export function handleGistError(err: Error) {
  return of({ type: "ERROR", payload: err, err: true });
}

/**
 * Handle user vs. anonymous gist actions in publishEpic
 * @param {action} action - The action being processed by the epic.
 * @param {store} reduxStore - The store containing state data.
 * return {Observable} publishNotebookObservable with appropriate parameters.
 */
export function handleGistAction(store: any, action: any) {
  const github = new Github();
  const state = store.getState();

  const filepath = selectors.currentFilepath(state);
  const notificationSystem = selectors.notificationSystem(state);

  // TODO: Switch GitHub publishing actions to content refs
  const contentRef = selectors.currentContentRef(state);
  if (!contentRef) {
    return empty();
  }
  // TODO: Switch GitHub publishing actions to content refs
  const content = selectors.content(state, { contentRef });
  // NOTE: This could save by having selectors for each model type
  //       have toDisk() selectors
  if (!content || content.type !== "notebook") {
    return empty();
  }

  const model = content.model;

  const notebookString = selectors.notebook.asString(model);
  const githubUsername = selectors.notebook.githubUsername(model);
  const gistId = selectors.notebook.gistId(model);

  let publishAsUser = false;

  if (action.type === actionTypes.PUBLISH_USER_GIST) {
    const githubToken = state.app.get("githubToken");
    github.authenticate({ type: "oauth", token: githubToken });
    publishAsUser = true;
  }

  return Observable.create(observer => {
    const filename = filepath ? path.parse(filepath).base : "Untitled.ipynb";
    const files = {};
    files[filename] = { content: notebookString };

    if (publishAsUser) {
      github.users.get({}, (err, res) => {
        if (err) throw err;
        notificationSystem.addNotification({
          title: "Authenticated",
          message: `Authenticated as ${res.data.login}`,
          level: "info"
        });
        if (githubUsername !== (res.data.login || undefined)) {
          observer.next(
            actions.overwriteMetadataField({
              field: "github_username",
              value: res.data.login,
              contentRef
            })
          );
          observer.next(
            actions.deleteMetadataField({ field: "gist_id", contentRef })
          );
        }
      });
    }
    notificationSystem.addNotification({
      title: "Uploading gist...",
      message: "Your notebook is being uploaded as a GitHub gist",
      level: "info"
    });
    // Already in a gist belonging to the user, update the gist

    const gistRequest =
      gistId && publishAsUser
        ? { files, id: gistId, public: false }
        : { files, public: false };
    if (gistRequest.id) {
      github.gists.edit(
        gistRequest,
        createGistCallback(observer, filename, notificationSystem, contentRef)
      );
    } else {
      github.gists.create(
        gistRequest,
        createGistCallback(observer, filename, notificationSystem, contentRef)
      );
    }
  });
}

/**
 * Epic to capture the end to end action of publishing and receiving the
 * response from the Github API.
 */
export const publishEpic = (action$: ActionsObservable<*>, store: any) => {
  const boundHandleGistAction = handleGistAction.bind(null, store);
  return action$.pipe(
    ofType(actionTypes.PUBLISH_USER_GIST, actionTypes.PUBLISH_ANONYMOUS_GIST),
    mergeMap(action => boundHandleGistAction(action)),
    catchError(handleGistError)
  );
};
