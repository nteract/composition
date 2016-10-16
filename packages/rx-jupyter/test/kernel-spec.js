import { expect } from 'chai';

import * as kernels from '../src/kernels';

const serverConfig = {
  endpoint: 'http://localhost:8888',
  crossDomain: true,
};

describe('kernels', () => {
  describe('createSettingsForList', () => {
    it('create AJAX settings for listing kernels', () => {
      const request = kernels.createSettingsForList(serverConfig);

      expect(request).to.deep.equal({
        url: 'http://localhost:8888/api/kernels',
        crossDomain: true,
        responseType: 'json',
      });
    });
  });

  describe('createSettingsForGet', () => {
    it('create AJAX settings for getting a kernel by ID', () => {
      const request = kernels.createSettingsForGet(serverConfig, 'test-id');

      expect(request).to.deep.equal({
        url: 'http://localhost:8888/api/kernels/test-id',
        crossDomain: true,
        responseType: 'json',
      });
    });
  });

  describe('createSettingsForStart', () => {
    it('create AJAX settings for creating a kernel', () => {
      const request = kernels.createSettingsForStart(serverConfig, 'python3', '~');

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
        },
      });
    });
  });

  describe('get', () => {
    it('creates an AjaxObservable configured for getting a kernel by id', () => {
      const id = '0000-1111-2222-3333';
      const kernel$ = kernels.get(serverConfig, id);
      const request = kernel$.request;
      expect(request.url).to.equal(`http://localhost:8888/api/kernels/${id}`);
      expect(request.method).to.equal('GET');
    });
  });

  describe('list', () => {
    it('creates an AjaxObservable configured for listing kernels', () => {
      const kernel$ = kernels.list(serverConfig);
      const request = kernel$.request;
      expect(request.url).to.equal('http://localhost:8888/api/kernels');
      expect(request.method).to.equal('GET');
    });
  });

  describe('start', () => {
    it('creates an AjaxObservable configured for starting a kernel', () => {
      const kernel$ = kernels.start(serverConfig, 'python3000', '/tmp');
      const request = kernel$.request;
      expect(request.url).to.equal('http://localhost:8888/api/kernels');
      expect(request.method).to.equal('POST');
      expect(request.body.path).to.equal('/tmp');
      expect(request.body.kernel_name).to.equal('python3000');
    });
  });
});
