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

  describe('createSettingsForKill', () => {
    it('creates AJAX settings for killing a kernel', () => {
      const id = '0000-1111-2222-3333';
      const request = kernels.createSettingsForKill(serverConfig, id);

      expect(request).to.deep.equal({
        url: `http://localhost:8888/api/kernels/${id}`,
        crossDomain: true,
        method: 'DELETE',
        responseType: 'json',
      });
    });
  });

  describe('createSettingsForInterrupt', () => {
    it('creates AJAX settings for interrupting a kernel', () => {
      const id = '0000-1111-2222-3333';
      const request = kernels.createSettingsForInterrupt(serverConfig, id);

      expect(request).to.deep.equal({
        url: `http://localhost:8888/api/kernels/${id}/interrupt`,
        crossDomain: true,
        method: 'POST',
        responseType: 'json',
      });
    });
  });

  describe('createSettingsForRestart', () => {
    it('creates AJAX settings for restarting a kernel', () => {
      const id = '0000-1111-2222-3333';
      const request = kernels.createSettingsForRestart(serverConfig, id);

      expect(request).to.deep.equal({
        url: `http://localhost:8888/api/kernels/${id}/restart`,
        crossDomain: true,
        method: 'POST',
        responseType: 'json',
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

  describe('kill', () => {
    it('creates an AjaxObservable configured for killing a kernel', () => {
      const id = '0000-1111-2222-3333';
      const kernel$ = kernels.kill(serverConfig, id);
      const request = kernel$.request;
      expect(request.url).to.equal(`http://localhost:8888/api/kernels/${id}`);
      expect(request.method).to.equal('DELETE');
    });
  });

  describe('interrupt', () => {
    it('creates an AjaxObservable configured for interrupting a kernel', () => {
      const id = '0000-1111-2222-3333';
      const kernel$ = kernels.interrupt(serverConfig, id);
      const request = kernel$.request;
      expect(request.url).to.equal(`http://localhost:8888/api/kernels/${id}/interrupt`);
      expect(request.method).to.equal('POST');
    });
  });

  describe('restart', () => {
    it('creates an AjaxObservable configured for restarting a kernel', () => {
      const id = '0000-1111-2222-3333';
      const kernel$ = kernels.restart(serverConfig, id);
      const request = kernel$.request;
      expect(request.url).to.equal(`http://localhost:8888/api/kernels/${id}/restart`);
      expect(request.method).to.equal('POST');
    });
  });
});
