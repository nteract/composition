import chai, { expect } from 'chai';
import { ActionsObservable } from 'redux-observable';

import {
  LOAD_CONFIG,
  loadConfigEpic,
  saveConfigOnChangeEpic,
  retryAndEmitError,
} from '../../../src/notebook/epics/config';

const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.use(sinonChai);

const Rx = require('rxjs/Rx');

const Observable = Rx.Observable;

describe('loadConfigEpic', () => {
  it('errors on a bad read', (done) => {
    const input$ = Observable.of({ type: LOAD_CONFIG }).share();
    const action$ = new ActionsObservable(input$);
    const responseActions = loadConfigEpic(action$);
    responseActions.subscribe(
      (x) => {
        expect(x.type).to.equal('ERROR');
        done();
      },
      expect.fail,
      expect.fail,
    );
  });
});

describe('saveConfigOnChangeEpic', () => {
  it('invokes a SAVE when the SET_CONFIG_KEY action happens', (done) => {
    const input$ = Observable.of({ type: 'SET_CONFIG_KEY' });
    const action$ = new ActionsObservable(input$);
    const responseActions = saveConfigOnChangeEpic(action$);
    responseActions.subscribe(
      (x) => {
        expect(x).to.deep.equal({ type: 'SAVE_CONFIG' });
        done();
      },
      expect.fail,
      expect.fail,
    );
  });
});

describe('retryAndEmitError', () => {
  it('returns the source observable, emitting an error action first', () => {
    const source = {
      startWith: sinon.stub(),
    };
    source.startWith.returns(source);
    const err = new Error('Oh no!');
    const newSource = retryAndEmitError(err, source);

    expect(source.startWith.calledOnce).to.equal(true);
    expect(source.startWith).to.have.been.calledWith({
      payload: err,
      error: true,
      type: 'ERROR',
    });

    expect(newSource).to.equal(source);
  });
});
