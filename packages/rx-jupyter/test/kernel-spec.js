import * as kernels from '../src/kernels';
import { expect } from 'chai';

const endpoint = 'http://localhost:8888';
const crossDomain = true;

describe('kernels', () => {
  describe('createSettingsForList', () => {
    it('creates the AJAX settings for listing the kernels', () => {
      const request = kernels.createSettingsForList(endpoint, crossDomain);

      expect(request).to.deep.equal({
        url: 'http://localhost:8888/api/kernels',
        crossDomain: true,
        responseType: 'json',
      });
    });
  });

  describe('createSettingsForGet', () => {
    it('creates the AJAX settings for getting a kernel by ID', () => {
      const request = kernels.createSettingsForGet(endpoint, crossDomain, 'test-id');

      expect(request).to.deep.equal({
        url: 'http://localhost:8888/api/kernels/test-id',
        crossDomain: true,
        responseType: 'json',
      });
    });
  });

  describe('createSettingsForStart', () => {
    it('creates the AJAX settings for creating a kernel', () => {
      const request = kernels.createSettingsForStart(endpoint, crossDomain, 'python3', '~');

      expect(request).to.deep.equal({
        url: 'http://localhost:8888/api/kernels',
        crossDomain: true,
        responseType: 'json',
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: {
          path: '~',
          kernel_name: 'python3',
        }
      });
    });
  });

  describe('get', () => {
    it('creates an AjaxObservable configured for getting a kernel by id', () => {
      const id = '0000-1111-2222-3333';
      const kernel$ = kernels.get(endpoint, crossDomain, id);
      const request = kernel$.request;
      expect(request.url).to.equal(`${endpoint}/api/kernels/${id}`);
      expect(request.method).to.equal("GET");
    })
  })

  describe('list', () => {
    it('creates an AjaxObservable configured for listing kernels', () => {
      const kernel$ = kernels.list(endpoint, crossDomain);
      const request = kernel$.request;
      expect(request.url).to.equal(`${endpoint}/api/kernels`);
      expect(request.method).to.equal("GET");
    })
  })

  describe('start', () => {
    it('creates an AjaxObservable configured for starting a kernel', () => {
      const kernel$ = kernels.start(endpoint, crossDomain, 'python3000', '/tmp');
      const request = kernel$.request;
      expect(request.url).to.equal(`${endpoint}/api/kernels`);
      expect(request.method).to.equal("POST");
      expect(request.body.path).to.equal('/tmp');
      expect(request.body.kernel_name).to.equal('python3000');
    })
  })

});
