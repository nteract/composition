import * as kernelspecs from '../src/kernelspecs';
import { expect } from 'chai';

const endpoint = 'http://localhost:8888';
const crossDomain = true;

describe('kernelspecs', () => {
  describe('createSettingsForList', () => {
    it('creates the AJAX settings for listing kernelspecs', () => {
      const request = kernelspecs.createSettingsForList(endpoint, crossDomain);

      expect(request).to.deep.equal({
        url: 'http://localhost:8888/api/kernelspecs',
        crossDomain: true,
        responseType: 'json',
      });
    });
  });

  describe('list', () => {
    it('creates an AjaxObservable configured for listing', () => {
      const kernelSpec$ = kernelspecs.list(endpoint, crossDomain);
      const request = kernelSpec$.request;
      expect(request.url).to.equal(`${endpoint}/api/kernelspecs`);
      expect(request.method).to.equal("GET");
    })
  })
})
