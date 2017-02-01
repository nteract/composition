import { expect } from 'chai';
import { ActionsObservable } from 'redux-observable';
const Rx = require('rxjs/Rx');
const Observable = Rx.Observable;

import {
  LOAD_CONFIG,
  SAVE_CONFIG,
  MERGE_CONFIG,
  SET_CONFIG_KEY,
  loadConfig,
  saveConfig,
  doneSavingConfig,
  configLoaded,
  loadConfigEpic,
  saveConfigOnChangeEpic,
  saveConfigEpic,
} from '../../../src/notebook/epics/config';

describe('loadConfigEpic', () => {
  it('errors on a bad read', (done) => {
    const input$ = Observable.of({ type: LOAD_CONFIG });
    const action$ = new ActionsObservable(input$);
    const actionBuffer = [];
    const responseActions = loadConfigEpic(action$);
    responseActions.subscribe(
      (x) => actionBuffer.push(x.type),
      (err) => expect.fail(),
      () => {
        expect(actionBuffer).to.deep.equal(['ERROR']);
        done();
      },
    );
  });
});

describe('saveConfigOnChangeEpic', () => {
  it('changes SET_CONFIG_KEY to SAVE_CONFIG', (done) => {
    const input$ = Observable.of({ type: SET_CONFIG_KEY });
    const action$ = new ActionsObservable(input$);
    const actionBuffer = [];
    const responseActions = saveConfigOnChangeEpic(action$);
    expect(responseActions.operator.value.type).to.equal('SAVE_CONFIG');
    responseActions.subscribe(
      (x) => actionBuffer.push(x),
      (err) => expect.fail(),
      () => {
        done();
      },
    );
  });
});

describe('saveConfigEpic', () => {
  it('errors on a bad writeFileObservable', (done) => {
    const input$ = Observable.of({ type: SAVE_CONFIG });
    const action$ = new ActionsObservable(input$);
    const actionBuffer = [];
    const responseActions = saveConfigEpic(action$);
    responseActions.subscribe(
      (x) => actionBuffer.push(x.type),
      (err) => expect.fail(),
      () => {
        expect(actionBuffer).to.deep.equal(['ERROR']);
        done();
      },
    );
  });
});
