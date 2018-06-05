// @flow
import * as fs from "fs";

import * as os from "os";

import * as path from "path";

import * as git from "isomorphic-git";

import { remote } from "electron";

import { selectors, actions, actionTypes } from "@nteract/core";
import {
  concatMap,
  catchError,
  map,
  mergeMap,
  switchMap
} from "rxjs/operators";
import { from } from "rxjs/observable/from";
import { of } from "rxjs/observable/of";
import { ofType } from "redux-observable";

import type { ActionsObservable } from "redux-observable";

/**
 * An epic that stages the notebook changes.
 */
export const gitAddEpic = (action$: ActionsObservable<*>, store: any) =>
  action$.pipe(
    ofType(actionTypes.GIT_ADD),
    mergeMap(action => {
      const state = store.getState();
      const contentRef = action.payload.contentRef;
      const content = selectors.content(state, { contentRef });
      if (!content) {
        return of(
          actions.gitAddFailed({
            error: new Error("no notebook loaded to add"),
            contentRef: action.payload.contentRef
          })
        );
      }
      const filepath = content.filepath;
      const repo = {
        fs,
        dir: filepath.substring(0, filepath.lastIndexOf("/"))
      };
      const notebookdir = filepath.split("/");
      const notebook = notebookdir[notebookdir.length - 1];
      const notificationSystem = selectors.notificationSystem(state);

      return from(git.add({ ...repo, filepath: notebook })).pipe(
        map(
          stage => actions.gitAddSuccessful(stage),
          notificationSystem.addNotification({
            title: "Changes Staged",
            message: `Changes to the notebook have been staged.`,
            dismissible: true,
            position: "tr",
            level: "success"
          })
        ),
        catchError(err => {
          actions.gitAddFailed(err);
        })
      );
    })
  );

/**
 * An epic that removes the notebook from git.
 */
export const gitRemoveEpic = (action$: ActionsObservable<*>, store: any) =>
  action$.pipe(
    ofType(actionTypes.GIT_REMOVE),
    mergeMap(action => {
      const state = store.getState();
      const contentRef = action.payload.contentRef;
      const content = selectors.content(state, { contentRef });
      if (!content) {
        return of(
          actions.gitRemoveFailed({
            error: new Error("no notebook loaded to remove"),
            contentRef: action.payload.contentRef
          })
        );
      }
      const filepath = content.filepath;
      const repo = {
        fs,
        dir: filepath.substring(0, filepath.lastIndexOf("/"))
      };
      const notebookdir = filepath.split("/");
      const notebook = notebookdir[notebookdir.length - 1];
      const notificationSystem = selectors.notificationSystem(state);

      return from(git.remove({ ...repo, filepath: notebook })).pipe(
        map(
          init => actions.gitRemoveSuccessful(init),
          notificationSystem.addNotification({
            title: "Remove Successful",
            message: `Notebook has been removed from the repository.`,
            dismissible: true,
            position: "tr",
            level: "success"
          })
        ),
        catchError(err => actions.gitRemoveFailed(err))
      );
    })
  );

export const copy = (file, dest) => {
  if (fs.existsSync(file)) {
    fs.createReadStream(file).pipe(fs.createWriteStream(dest));
  }
};

/**
 * An epic that initializes a git repository.
 */
export const gitInitEpic = (action$: ActionsObservable<*>, store: any) =>
  action$.pipe(
    ofType(actionTypes.GIT_INIT),
    mergeMap(action => {
      const state = store.getState();
      const contentRef = action.payload.contentRef;
      const content = selectors.content(state, { contentRef });
      if (!content) {
        return of(
          actions.gitInitFailed({
            error: new Error("no notebook loaded"),
            contentRef: action.payload.contentRef
          })
        );
      }
      const filepath = content.filepath;
      const repo = {
        fs,
        dir: filepath.substring(0, filepath.lastIndexOf("/"))
      };
      const notificationSystem = selectors.notificationSystem(state);

      return from(git.init(repo)).pipe(
        map(
          init => actions.gitInitSuccessful(init),
          notificationSystem.addNotification({
            title: "Repository Created",
            message: `A Git repository has been created.`,
            dismissible: true,
            position: "tr",
            level: "success"
          })
        ),
        catchError(err => actions.gitInitFailed(err))
      );
    })
  );

/**
 * An epic that commits staged changes to notebook.
 */
export const gitCommitEpic = (action$: ActionsObservable<*>, store: any) =>
  action$.pipe(
    ofType(actionTypes.GIT_COMMIT),
    mergeMap(action => {
      const state = store.getState();
      const contentRef = action.payload.contentRef;
      const content = selectors.content(state, { contentRef });
      if (!content) {
        return of(
          actions.gitCommitFailed({
            error: new Error("no notebook loaded to commit"),
            contentRef: action.payload.contentRef
          })
        );
      }
      const filepath = content.filepath;
      const notificationSystem = selectors.notificationSystem(state);
      const repo = {
        fs,
        dir: filepath.substring(0, filepath.lastIndexOf("/"))
      };
      const response = remote.dialog.showMessageBox({
        type: "question",
        buttons: ["Yes", "No"],
        title: "Confirm",
        message: "Commit changes?"
      });

      if (response == 0) {
        return from(
          git.commit({ ...repo, message: "chore: updating notebook" })
        ).pipe(
          map(
            commit => actions.gitCommitSuccessful(commit),
            notificationSystem.addNotification({
              title: "Changes Commited",
              message: `Notebook changes have been commited.`,
              dismissible: true,
              position: "tr",
              level: "success"
            })
          ),
          catchError(err => actions.gitCommitFailed(err))
        );
      }
    })
  );

/**
 * An epic that initializes a git repository.
 */
export const gitCopyConfigEpic = (action$: ActionsObservable<*>, store: any) =>
  action$.pipe(
    ofType(actionTypes.GIT_COPY_CONFIG),
    mergeMap(action => {
      const state = store.getState();
      const contentRef = action.payload.contentRef;
      const content = selectors.content(state, { contentRef });
      if (!content) {
        return of(
          actions.gitCopyConfigFailed({
            error: new Error("no notebook loaded to copy config"),
            contentRef: action.payload.contentRef
          })
        );
      }
      const filepath = content.filepath;
      const notificationSystem = selectors.notificationSystem(state);
      const gitConfig = path.join(os.homedir(), ".gitconfig");
      const localGitConfig = path.join(
        filepath.substring(0, filepath.lastIndexOf("/")),
        ".git/config"
      );

      return of(copy(gitConfig, localGitConfig)).pipe(
        map(
          init => actions.gitCopyConfigSuccessful(init),
          notificationSystem.addNotification({
            title: "Git Config successfull",
            message: `Git config has successfully been set.`,
            dismissible: true,
            position: "tr",
            level: "success"
          })
        ),
        catchError(err => actions.gitCopyConfigFailed(err))
      );
    })
  );

/**
 * An epic that lists the current git branch.
 */
export const gitListBranchEpic = (action$: ActionsObservable<*>, store: any) =>
  action$.pipe(
    ofType(actionTypes.GIT_LIST_BRANCH),
    mergeMap(action => {
      const state = store.getState();
      const contentRef = action.payload.contentRef;
      const content = selectors.content(state, { contentRef });
      if (!content) {
        return of(
          actions.gitListBranchFailed({
            error: new Error("no notebook loaded to list currentBranch"),
            contentRef: action.payload.contentRef
          })
        );
      }
      const filepath = content.filepath;
      const repo = {
        fs,
        dir: filepath.substring(0, filepath.lastIndexOf("/"))
      };
      if (
        !fs.existsSync(
          filepath.substring(0, filepath.lastIndexOf("/")) + "/.git/"
        )
      ) {
        return of(
          actions.gitListBranchFailed({
            error: new Error("no notebook loaded to list currentBranch"),
            contentRef: action.payload.contentRef
          })
        );
      }

      return from(git.resolveRef({ ...repo, ref: "HEAD", depth: 1 })).pipe(
        map(currentBranch =>
          actions.gitListBranchSuccessful({
            currentBranch: currentBranch.substring(
              currentBranch.lastIndexOf("/") + 1,
              currentBranch.length
            )
          })
        ),
        catchError(err => actions.gitListBranchFailed(err))
      );
    })
  );
