import { expect } from 'chai';

import * as contents from '../src/contents';

const serverConfig = {
  endpoint: 'http://localhost:8888',
  crossDomain: true,
};

describe('contents', () => {
  describe('createSettingsForGet', () => {
    it('creates the AJAX settings for getting content', () => {
      const settings = contents.createSettingsForGet(serverConfig, '/walla/walla/bingbang.ipynb');

      expect(settings).to.deep.equal({
        url: 'http://localhost:8888/api/contents/walla/walla/bingbang.ipynb',
        crossDomain: true,
        responseType: 'json',
      });
    });
  });

  describe('get', () => {
    it('creates the AjaxObservable for getting content', () => {
      const content$ = contents.get(serverConfig, '/walla/walla/bingbang.ipynb');
      const request = content$.request;
      expect(request.url).to.equal('http://localhost:8888/api/contents/walla/walla/bingbang.ipynb');
      expect(request.method).to.equal('GET');
    });
  });

  describe('createSettingsForCreate', () => {
    it('creates the AJAX setting or creating content', () => {
      const model = {
        type: 'notebook',
        name: 'c.ipynb',
        writable: true,
        content: {},
        format: 'json',
      };
      const settings = contents.createSettingsForCreate(serverConfig, '/a/b/c.ipynb', model);
      expect(settings).to.deep.equal({
        url: 'http://localhost:8888/api/contents/a/b/c.ipynb',
        crossDomain: true,
        responseType: 'json',
        method: 'POST',
        body: model,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });
  });

  describe('create', () => {
    it('creates the AjaxObservable for creating content', () => {
      const model = {
        type: 'notebook',
        name: 'c.ipynb',
        writable: true,
        content: {},
        format: 'json',
      };
      const create$ = contents.create(serverConfig, '/a/b/c.ipynb', model);
      const request = create$.request;
      expect(request.url).to.equal('http://localhost:8888/api/contents/a/b/c.ipynb');
      expect(request.method).to.equal('POST');
    });
  });

  describe('createSettingsForRemove', () => {
    it('creates the settings for the AJAX request to remove contents', () => {
      const settings = contents.createSettingsForRemove(serverConfig, '/path.ipynb');
      expect(settings).to.deep.equal({
        url: 'http://localhost:8888/api/contents/path.ipynb',
        crossDomain: true,
        responseType: 'json',
        method: 'DELETE',
      });
    });
  });

  describe('remove', () => {
    it('creates the AjaxObservable for removing contents', () => {
      const remove$ = contents.remove(serverConfig, '/path.ipynb');
      const request = remove$.request;
      expect(request.url).to.equal('http://localhost:8888/api/contents/path.ipynb');
      expect(request.method).to.equal('DELETE');
    });
  });
});
