import epics from '../../../src/notebook/epics';
import { expect } from 'chai';

const Rx = require('rxjs/Rx');

import { ActionsObservable } from 'redux-observable';

describe('epics', () => {
  it('is an array of epics', () => {
    expect(epics).to.be.an.array;

    const action$ = new ActionsObservable();
    const wired = epics.map(epic => epic(action$));
  });
});
