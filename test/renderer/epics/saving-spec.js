import { expect } from 'chai';

import {
  dummyCommutable
} from '../dummy-nb';

import { ActionsObservable } from 'redux-observable';

const Rx = require('rxjs/Rx');

const Observable = Rx.Observable;

import {
  save,
  saveAs,
} from '../../../src/notebook/actions';

import {
  SAVE,
  SAVE_AS,
  DONE_SAVING,
  CHANGE_FILENAME,
} from '../../../src/notebook/constants';

import {
  saveEpic,
  saveAsEpic,
} from '../../../src/notebook/epics/saving';


describe('save', () => {
  it('creates a SAVE action', () => {
    expect(save('test/test-save.ipynb', dummyCommutable)).to.deep.equal({
        type: SAVE,
        filename: 'test/test-save.ipynb',
        notebook: dummyCommutable,
    });
  });
});

describe('saveAs', () => {
  it('creates a SAVE_AS action', () => {
    expect(saveAs('test/test-saveas.ipynb', dummyCommutable)).to.deep.equal({
        type: SAVE_AS,
        filename: 'test/test-saveas.ipynb',
        notebook: dummyCommutable,
    });
  });
});

describe('saveEpic', () => {
  it('throws an error when no filename provided', (done) => {
    const input$ = Observable.of({type: SAVE });
    const action$ = new ActionsObservable(input$);
    const actionBuffer = [];
    const responseActions = saveEpic(action$).catch(error => {
      expect(error.message).to.equal('save needs a filename');
      return new Observable.of({type: SAVE});
    });
    responseActions.subscribe(
      (x) => actionBuffer.push(x.type), // Every action that goes through should get stuck on an array
      (err) => expect.fail(err, null), // It should not error in the stream
      () => {
        expect(actionBuffer).to.deep.equal([SAVE]);
        done(); // ;
      });
  });
  it('works when passed filename and notebook', (done) => {
    const input$ = Observable.of(save('filename', dummyCommutable));
    const action$ = new ActionsObservable(input$);
    let actionBuffer = [];
    const responseActions = saveEpic(action$);
    responseActions.subscribe(
      (x) => actionBuffer.push(x.type), // Every action that goes through should get stuck on an array
      (err) => expect.fail() , // It should not error in the stream
      () => {
        expect(actionBuffer).to.deep.equal([DONE_SAVING]);
        done(); // ;
      });
  });
});

describe('saveAsEpic', () => {
  it('works when passed actions of type SAVE_AS', (done) => {
    const input$ = Observable.of(saveAs('filename', dummyCommutable));
    const action$ = new ActionsObservable(input$);
    let actionBuffer = [];
    const responseActions = saveAsEpic(action$)
    responseActions.subscribe(
      (x) => actionBuffer.push(x.type), // Every action that goes through should get stuck on an array
      (err) => { expect.fail() }, // It should not error in the stream
      () => {
        expect(actionBuffer).to.deep.equal([CHANGE_FILENAME, SAVE]);
        done();  // ;
      },
    );
  });
});
