import { expect } from 'chai';

import * as kernelspecs from '../src/kernelspecs';

const serverConfig = {
  endpoint: 'http://localhost:8888',
  crossDomain: true,
};

describe('kernelspecs', () => {
  describe('createSettingsForList', () => {
    it('creates the AJAX settings for listing kernelspecs', () => {
      const request = kernelspecs.createSettingsForList(serverConfig);

      expect(request).to.deep.equal({
        url: 'http://localhost:8888/api/kernelspecs',
        crossDomain: true,
        responseType: 'json',
      });
    });
  });

  describe('list', () => {
    it('creates an AjaxObservable configured for listing', () => {
      const kernelSpec$ = kernelspecs.list(serverConfig);
      const request = kernelSpec$.request;
      expect(request.url).to.equal('http://localhost:8888/api/kernelspecs');
      expect(request.method).to.equal('GET');
    });
  });
});
