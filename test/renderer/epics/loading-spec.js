import { ActionsObservable } from 'redux-observable';

import { expect } from 'chai';

import {
  dummyCommutable,
  dummy,
} from '../dummy-nb';

import {
  load,
  newNotebook,
  notebookLoaded,
  extractNewKernel,
  convertRawNotebook,
  LOAD,
  loadEpic,
  NEW_NOTEBOOK,
  newNotebookEpic,
} from '../../../src/notebook/epics/loading';

const path = require('path');
const Rx = require('rxjs/Rx');

const Observable = Rx.Observable;

describe('load', () => {
  it('loads a notebook', () => {
    expect(load('mytest.ipynb'))
      .to.deep.equal({ type: 'LOAD', filename: 'mytest.ipynb' });
  });
});

describe('newNotebook', () => {
  it('creates a new notebook', () => {
    expect(newNotebook({ spec: 'hokey' }, '/tmp'))
      .to.deep.equal({
        type: 'NEW_NOTEBOOK',
        kernelSpec: { spec: 'hokey' },
        cwd: '/tmp',
      });
  });
});

describe('notebookLoaded', () => {
  it('sets a notebook', () => {
    expect(notebookLoaded('test', dummyCommutable))
      .to.deep.equal({
        type: 'SET_NOTEBOOK',
        filename: 'test',
        notebook: dummyCommutable,
      });
  });
});

describe('extractNewKernel', () => {
  it('extracts and launches the kernel from a notebook', () => {
    expect(extractNewKernel('/tmp/test.ipynb', dummyCommutable)).to.deep.equal({
      kernelSpecName: 'python3',
      cwd: path.resolve('/tmp'),
    });
  });
});

describe('convertRawNotebook', () => {
  it('converts a raw notebook', () => {
    const converted = convertRawNotebook('/tmp/test.ipynb', dummy);
    expect(converted.filename).to.equal('/tmp/test.ipynb');

    const notebook = converted.notebook;
    expect(dummyCommutable.get('metadata').equals(notebook.get('metadata')))
      .to.be.true;
  });
});

describe('loadingEpic', () => {
  it('errors without a filename', (done) => {
    const input$ = Observable.of({ type: LOAD });
    const action$ = new ActionsObservable(input$);
    const actionBuffer = [];
    const responseActions = loadEpic(action$);
    responseActions.subscribe(
      x => actionBuffer.push(x.type),
      (err) => {
        expect(err.message).to.equal('load needs a filename');
        done();
      },
      () => {
        expect.fail();
      },
    );
  });
  it('errors when file cant be read', (done) => {
    const input$ = Observable.of({ type: LOAD, filename: 'file' });
    const action$ = new ActionsObservable(input$);
    const actionBuffer = [];
    const responseActions = loadEpic(action$);
    responseActions.subscribe(
      x => actionBuffer.push(x.type),
      () => expect.fail(),
      () => {
        expect(actionBuffer).to.deep.equal(['ERROR']);
        done();
      },
    );
  });
});

describe('newNotebookEpic', () => {
  it('calls new Kernel after creating a new notebook', (done) => {
    const input$ = Observable.of({ type: NEW_NOTEBOOK });
    const action$ = new ActionsObservable(input$);
    const actionBuffer = [];
    const responseActions = newNotebookEpic(action$);
    responseActions.subscribe(
      x => actionBuffer.push(x.type),
      () => expect.fail(),
      () => {
        expect(actionBuffer).to.deep.equal(['SET_NOTEBOOK', 'LAUNCH_KERNEL']);
        done();
      },
    );
  });
});
