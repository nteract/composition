import { ActionsObservable } from 'redux-observable';

import { expect } from 'chai';

import { dummyCommutable } from '../dummy-nb';

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

const Rx = require('rxjs/Rx');

const Observable = Rx.Observable;

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
    const action$ = ActionsObservable.of({ type: SAVE });
    const responseActions = saveEpic(action$).catch(error => {
      expect(error.message).to.equal('save needs a filename');
      return Observable.of({ type: SAVE });
    });
    responseActions
      .toArray()
      .subscribe(
        // Every action that goes through should get stuck on an array
        (actions) => {
          const types = actions.map(({ type }) => type);
          expect(types).to.deep.equal([SAVE]);
        },
        (err) => expect.fail(err, null), // It should not error in the stream
        () => done(),
      );
  });
  it('works when passed filename and notebook', (done) => {
    const action$ = ActionsObservable.of(save('filename', dummyCommutable));
    const responseActions = saveEpic(action$);
    responseActions
      .toArray()
      .subscribe(
        // Every action that goes through should get stuck on an array
        (actions) => {
          const types = actions.map(({ type }) => type);
          expect(types).to.deep.equal([DONE_SAVING]);
        },
        () => expect.fail(), // It should not error in the stream
        () => done(),
      );
  });
});

describe('saveAsEpic', () => {
  it('works when passed actions of type SAVE_AS', (done) => {
    const action$ = ActionsObservable.of(saveAs('filename', dummyCommutable));
    const responseActions = saveAsEpic(action$);
    responseActions
      .toArray()
      .subscribe(
        // Every action that goes through should get stuck on an array
        (actions) => {
          const types = actions.map(({ type }) => type);
          expect(types).to.deep.equal([CHANGE_FILENAME, SAVE]);
        },
        () => { expect.fail(); }, // It should not error in the stream
        () => done(),
      );
  });
});
