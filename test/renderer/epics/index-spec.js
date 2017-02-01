import { expect } from 'chai';

import { ActionsObservable } from 'redux-observable';

import epics from '../../../src/notebook/epics';

describe('epics', () => {
  it('is an array of epics', () => {
    expect(epics).to.be.an.array;

    const action$ = new ActionsObservable();
    epics.map(epic => epic(action$));
  });
});
