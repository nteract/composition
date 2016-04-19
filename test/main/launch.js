import { expect } from 'chai';

import { launchNewNotebook } from '../../src/main/launch';
describe('launch', () => {
  describe('launchNewNotebook', () => {
    it('launches a window', () => {
      return launchNewNotebook().then(win => {
        expect(win).to.not.be.undefined;
      });
    });
  });
});
