import { expect } from 'chai';

import * as contents from '../src/contents';

const serverConfig = {
  endpoint: 'http://localhost:8888',
  crossDomain: true,
};

describe('contents', () => {
  describe('get', () => {
    it('creates the AjaxObservable for getting content', () => {
      const content$ = contents.get(serverConfig, '/walla/walla/bingbang.ipynb');
      const request = content$.request;
      expect(request.url).to.equal('http://localhost:8888/api/contents/walla/walla/bingbang.ipynb');
      expect(request.method).to.equal('GET');
      expect(request.crossDomain).to.equal(true);
      expect(request.responseType).to.equal('json');
    });
    it('creates the AjaxObservable for getting content with query parameters', () => {
      const content$ = contents.get(serverConfig, '/walla/walla', { type: 'directory' });
      const request = content$.request;
      expect(request.url).to.equal('http://localhost:8888/api/contents/walla/walla?type=directory');
      expect(request.method).to.equal('GET');
      expect(request.crossDomain).to.equal(true);
      expect(request.responseType).to.equal('json');
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
      expect(request.headers).to.deep.equal({
        'Content-Type': 'application/json',
      })
      expect(request.body).to.deep.equal(model);
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
