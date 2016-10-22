import { expect } from 'chai';

import * as sessions from '../src/sessions';

const serverConfig = {
  endpoint: 'http://localhost:8888',
  crossDomain: true,
};

describe('sessions', () => {
  describe('createSettingsForList', () => {
    it('creates the AJAX settings for listing sessions', () => {
      const request = sessions.createSettingsForList(serverConfig);
      expect(request).to.deep.equal({
        url: 'http://localhost:8888/api/sessions',
        crossDomain: serverConfig.crossDomain,
        responseType: 'json',
      });
    });
  });

  describe('list', () => {
    it('creates an AjaxObservable for listing the sessions', () => {
      const session$ = sessions.list(serverConfig);
      const request = session$.request;
      expect(request.url).to.equal('http://localhost:8888/api/sessions');
      expect(request.method).to.equal('GET');
    });
  });

  describe('createSettingsForGet', () => {
    it('creates the AJAX setings for getting session info', () => {
      const request = sessions.createSettingsForGet(serverConfig, 'uuid');
      expect(request).to.deep.equal({
        url: 'http://localhost:8888/api/sessions/uuid',
        crossDomain: serverConfig.crossDomain,
        responseType: 'json',
      });
    });
  });

  describe('get', () => {
    it('creates an AjaxObservable for getting particular session info', () => {
      const session$ = sessions.get(serverConfig, 'uuid');
      const request = session$.request;
      expect(request.url).to.equal('http://localhost:8888/api/sessions/uuid');
      expect(request.method).to.equal('GET');
    });
  });

  describe('createSettingsForDestroy', () => {
    it('creates the AJAX setings for destroying a session', () => {
      const request = sessions.createSettingsForDestroy(serverConfig, 'uuid');
      expect(request).to.deep.equal({
        url: 'http://localhost:8888/api/sessions/uuid',
        crossDomain: serverConfig.crossDomain,
        responseType: 'json',
        method: 'DELETE',
      });
    });
  });

  describe('destroy', () => {
    it('creates an AjaxObservable for destroying a session', () => {
      const session$ = sessions.destroy(serverConfig, 'uuid');
      const request = session$.request;
      expect(request.url).to.equal('http://localhost:8888/api/sessions/uuid');
      expect(request.method).to.equal('DELETE');
    });
  });

  describe('createSettingsForRename', () => {
    it('creates the AJAX setings for renaming a session', () => {
      const request = sessions.createSettingsForRename(serverConfig, 'uuid', { kernel_name: 'kernel-name', kernel_id: 'kernel-id', name: 'session-name', path: '~' });
      expect(request).to.deep.equal({
        url: 'http://localhost:8888/api/sessions/uuid',
        crossDomain: serverConfig.crossDomain,
        responseType: 'json',
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'PATCH',
        body: {
          kernel: { name: 'kernel-name', id: 'kernel-id' },
          name: 'session-name',
          path: '~',
          type: 'notebook',
        },
      });
    });
  });

  describe('rename', () => {
    it('creates an AjaxObservable for getting particular session info', () => {
      const session$ = sessions.rename(serverConfig, 'uuid', { kernel_name: 'kernel-name', kernel_id: 'kernel-id', name: 'session-name', path: '~' });
      const request = session$.request;
      expect(request.url).to.equal('http://localhost:8888/api/sessions/uuid');
      expect(request.method).to.equal('PATCH');
    });
  });

  describe('createSettingsForCreate', () => {
    it('creates the AJAX setings for creating a session', () => {
      const request = sessions.createSettingsForCreate(serverConfig, { kernel_name: 'kernel-name', kernel_id: 'kernel-id', name: 'session-name', path: '~' });
      expect(request).to.deep.equal({
        url: 'http://localhost:8888/api/sessions',
        crossDomain: serverConfig.crossDomain,
        responseType: 'json',
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: {
          kernel: { name: 'kernel-name', id: 'kernel-id' },
          name: 'session-name',
          path: '~',
          type: 'notebook',
        },
      });
    });
  });

  describe('create', () => {
    it('creates an AjaxObservable for getting particular session info', () => {
      const session$ = sessions.create(serverConfig, { kernel_name: 'kernel-name', kernel_id: 'kernel-id', name: 'session-name', path: '~' });
      const request = session$.request;
      expect(request.url).to.equal('http://localhost:8888/api/sessions');
      expect(request.method).to.equal('POST');
    });
  });
});
