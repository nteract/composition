import { expect } from 'chai';

import {
  mark,
  measure,
  getEntries,
  clear,
} from '../../../src/notebook/performance';

describe('mark', () => {
  it('does not throw', () => {
    mark('test');
  });
});

describe('clear', () => {
  it('does not throw', () => {
    clear();
  });
});

describe('measure', () => {
  it('does not throw', () => {
    mark('test1');
    mark('test2');
    measure('span', 'test1', 'test2');
  });
});

describe('getEntries', () => {
  it('returns an array', () => {
    expect(getEntries()).to.be.instanceof(Array);
  });
});
