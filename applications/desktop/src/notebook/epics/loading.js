/* @flow */

import { ActionsObservable, ofType } from "redux-observable";

import { monocellNotebook, fromJS, parseNotebook } from "@nteract/commutable";

import type { Notebook, ImmutableNotebook } from "@nteract/commutable";

import { readFileObservable } from "fs-observable";
import {
  launchKernelByName,
  launchKernel,
  setNotebook
} from "@nteract/core/actions";

const path = require("path");

import { of } from "rxjs/observable/of";
import { map, tap, mergeMap, switchMap, catchError } from "rxjs/operators";

import * as actionTypes from "@nteract/core/actionTypes";

/**
 * Creates a new kernel based on the language info in the notebook.
 *
 * @param  {String}  filename  The filename of the notebook being loaded
 * @param  {Immutable<Map>}  notebook  The notebook to extract langauge info from
 *
 * @returns  {ActionObservable}  ActionObservable for a LAUNCH_KERNEL_SUCCESSFUL action
 */
export const extractNewKernel = (
  filename: string,
  notebook: ImmutableNotebook
) => {
  const cwd =
    (filename && path.dirname(path.resolve(filename))) || process.cwd();
  const kernelSpecName = notebook.getIn(
    ["metadata", "kernelspec", "name"],
    notebook.getIn(["metadata", "language_info", "name"], "python3")
  );
  return {
    cwd,
    kernelSpecName
  };
};

/**
 * Converts a notebook from JSON to an Immutable.Map.
 *
 * @param  {String}  filename The filename of the notebook to convert
 * @param  {String}  data  The raw JSON of the notebook
 *
 * @returns  {Object}  The filename and notebook in Immutable.Map form
 */
export const convertRawNotebook = (filename: string, data: string) => ({
  filename,
  notebook: fromJS(parseNotebook(data))
});

/**
 * Loads a notebook and launches its kernel.
 *
 * @param  {ActionObservable}  A LOAD action with the notebook filename
 */
export const loadEpic = (actions: ActionsObservable<*>) =>
  actions.pipe(
    ofType(actionTypes.LOAD),
    tap(action => {
      // If there isn't a filename, save-as it instead
      if (!action.filename) {
        throw new Error("load needs a filename");
      }
    }),
    // Switch map since we want the last load request to be the lead
    switchMap(action =>
      readFileObservable(action.filename).pipe(
        map(data => convertRawNotebook(action.filename, data)),
        mergeMap(({ filename, notebook }) => {
          const { cwd, kernelSpecName } = extractNewKernel(filename, notebook);
          return of(
            setNotebook(filename, notebook),
            // Find kernel based on kernel name
            // NOTE: Conda based kernels and remote kernels will need
            // special handling
            launchKernelByName(kernelSpecName, cwd)
          );
        }),
        catchError(err => of({ type: "ERROR", payload: err, error: true }))
      )
    )
  );

/**
 * Sets a new empty notebook.
 *
 * @param  {ActionObservable}  ActionObservable for NEW_NOTEBOOK action
 */
export const newNotebookEpic = (action$: ActionsObservable<*>) =>
  action$.pipe(
    ofType(actionTypes.NEW_NOTEBOOK),
    switchMap(action =>
      of(
        {
          type: actionTypes.SET_NOTEBOOK,
          notebook: monocellNotebook
        },
        launchKernel(action.kernelSpec, action.cwd)
      )
    )
  );
