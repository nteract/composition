/* @flow */

import { ActionsObservable } from "redux-observable";

import { monocellNotebook, fromJS, parseNotebook } from "@nteract/commutable";

import type { Notebook, ImmutableNotebook } from "@nteract/commutable";

import { readFileObservable } from "fs-observable";
import { newKernelByName, newKernel } from "../actions";

const path = require("path");

import { of } from "rxjs/observable/of";
import { map, tap, mergeMap, switchMap, catchError } from "rxjs/operators";

export const LOAD = "LOAD";
export const SET_NOTEBOOK = "SET_NOTEBOOK";
export const NEW_NOTEBOOK = "NEW_NOTEBOOK";

export function load(filename: string) {
  return {
    type: LOAD,
    filename
  };
}

// TODO: Use a kernel spec type
export function newNotebook(kernelSpec: Object, cwd: string) {
  return {
    type: NEW_NOTEBOOK,
    kernelSpec,
    cwd: cwd || process.cwd()
  };
}

// Expects notebook to be JS Object or Immutable.js
export const notebookLoaded = (filename: string, notebook: Notebook) => ({
  type: SET_NOTEBOOK,
  filename,
  notebook
});

/**
  * Creates a new kernel based on the language info in the notebook.
  *
  * @param  {String}  filename  The filename of the notebook being loaded
  * @param  {Immutable<Map>}  notebook  The notebook to extract langauge info from
  *
  * @returns  {ActionObservable}  ActionObservable for a NEW_KERNEL action
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
  actions.ofType(LOAD).pipe(
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
            notebookLoaded(filename, notebook),
            // Find kernel based on kernel name
            // NOTE: Conda based kernels and remote kernels will need
            // special handling
            newKernelByName(kernelSpecName, cwd)
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
  action$.ofType(NEW_NOTEBOOK).pipe(
    switchMap(action =>
      of(
        {
          type: "SET_NOTEBOOK",
          notebook: monocellNotebook
        },
        newKernel(action.kernelSpec, action.cwd)
      )
    )
  );
