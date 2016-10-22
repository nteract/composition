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

  describe('createSettingsForCreate', () => {
    it('creates an AjaxObservable for creating content', () => {
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
});
