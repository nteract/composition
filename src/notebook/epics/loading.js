import { emptyNotebook, emptyCodeCell, appendCell } from 'commutable';
import { readFileObservable } from '../../utils/fs';
import { newKernel } from '../actions';

const Rx = require('rxjs/Rx');
const commutable = require('commutable');

const path = require('path');

const Observable = Rx.Observable;

export const LOAD = 'LOAD';
export const SET_NOTEBOOK = 'SET_NOTEBOOK';
export const NEW_NOTEBOOK = 'NEW_NOTEBOOK';

export const load = (filename) => ({ type: LOAD, filename });

export const newNotebook = (kernelSpecName, cwd) => ({
  type: NEW_NOTEBOOK,
  kernelSpecName,
  cwd: cwd || process.cwd(),
});

// Expects notebook to be JS Object or Immutable.js
export const notebookLoaded = (filename, notebook) => ({
  type: SET_NOTEBOOK,
  filename,
  notebook,
});

/**
  * Creates a new kernel based on the language info in the notebook.
  *
  * @param  {String}  filename  The filename of the notebook being loaded
  * @param  {Immutable<Map>}  notebook  The notebook to extract langauge info from
  *
  * @returns  {ActionObservable}  A NEW_KERNEL action
  */
export const extractNewKernel = (filename, notebook) => {
  const cwd = (filename && path.dirname(path.resolve(filename))) || process.cwd();
  const kernelName = notebook.getIn(
    ['metadata', 'kernelspec', 'name'], notebook.getIn(
      ['metadata', 'language_info', 'name'],
        'python3'));
  return newKernel(kernelName, cwd);
};

/**
  * Converts a notebook from JSON to an Immutable.Map.
  *
  * @param  {String}  filename The filename of the notebook to convert
  * @param  {String}  data  The raw JSON of the notebook
  *
  * @returns  {Object}  The filename and notebook in Immutable.Map form
  */
export const convertRawNotebook = (filename, data) => ({
  filename,
  notebook: commutable.fromJS(JSON.parse(data)),
});

/**
  * Loads a notebook and launches its kernel.
  *
  * @param  {ActionObservable}  A LOAD action with the notebook filename 
  */
export const loadEpic = actions =>
  actions.ofType(LOAD)
    .do(action => {
      // If there isn't a filename, save-as it instead
      if (!action.filename) {
        throw new Error('load needs a filename');
      }
    })
    // Switch map since we want the last load request to be the lead
    .switchMap(action =>
      readFileObservable(action.filename)
        .map((data) => convertRawNotebook(action.filename, data))
        .flatMap(({ filename, notebook }) =>
          Observable.of(
            notebookLoaded(filename, notebook),
            extractNewKernel(filename, notebook),
          )
        )
        .catch((err) =>
          Observable.of({ type: 'ERROR', payload: err, error: true })
        )
    );

/**
  * Sets a new empty notebook.
  *
  * @param  {ActionObservable}  A NEW_NOTEBOOK action
  */
const starterNotebook = appendCell(emptyNotebook, emptyCodeCell);
export const newNotebookEpic = action$ =>
  action$.ofType(NEW_NOTEBOOK)
    .switchMap(action =>
      Observable.of(
        {
          type: 'SET_NOTEBOOK',
          notebook: starterNotebook,
        },
        newKernel(action.kernelSpecName, action.cwd),
      )
    );
