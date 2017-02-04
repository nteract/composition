import { expect } from 'chai';
import { ActionsObservable } from 'redux-observable';

import {
  saveConfigOnChangeEpic,
} from '../../../src/notebook/epics/config';

const Rx = require('rxjs/Rx');

const Observable = Rx.Observable;

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
