import { expect } from "chai";

import * as contents from "../src/contents";

const serverConfig = {
  endpoint: "http://localhost:8888",
  crossDomain: true
};
describe("contents", () => {
  describe("remove", () => {
    it("creates the AjaxObservable for removing contents", () => {
      const remove$ = contents.remove(serverConfig, "/path.ipynb");
      const request = remove$.request;
      expect(request.url).to.equal(
        "http://localhost:8888/api/contents/path.ipynb"
      );
      expect(request.method).to.equal("DELETE");
    });
  });
  describe("get", () => {
    it("creates the AjaxObservable for getting content", () => {
      const content$ = contents.get(
        serverConfig,
        "/walla/walla/bingbang.ipynb"
      );
      const request = content$.request;
      expect(request.url).to.equal(
        "http://localhost:8888/api/contents/walla/walla/bingbang.ipynb"
      );
      expect(request.method).to.equal("GET");
      expect(request.crossDomain).to.equal(true);
      expect(request.responseType).to.equal("json");
    });
    it("creates the AjaxObservable for getting content with query parameters", () => {
      const content$ = contents.get(serverConfig, "/walla/walla", {
        type: "directory"
      });
      const request = content$.request;
      expect(request.url).to.equal(
        "http://localhost:8888/api/contents/walla/walla?type=directory"
      );
      expect(request.method).to.equal("GET");
      expect(request.crossDomain).to.equal(true);
      expect(request.responseType).to.equal("json");
    });
  });

  describe("update", () => {
    it("creates the AjaxObservable for renaming a file", () => {
      const model = { path: "renamed/path" };
      const content$ = contents.update(serverConfig, "/path/to/rename", model);
      const request = content$.request;
      expect(request.url).to.equal(
        "http://localhost:8888/api/contents/path/to/rename"
      );
      expect(request.method).to.equal("PATCH");
      expect(request.body).to.deep.equal(model);
      expect(request.crossDomain).to.equal(true);
      expect(request.responseType).to.equal("json");
    });
  });

  describe("create", () => {
    it("creates the AjaxObservable for creating content", () => {
      const model = {
        type: "notebook",
        name: "c.ipynb",
        writable: true,
        content: {},
        format: "json"
      };
      const create$ = contents.create(serverConfig, "/a/b/c.ipynb", model);
      const request = create$.request;
      expect(request.url).to.equal(
        "http://localhost:8888/api/contents/a/b/c.ipynb"
      );
      expect(request.method).to.equal("POST");
      expect(request.headers).to.deep.equal({
        "Content-Type": "application/json"
      });
      expect(request.body).to.deep.equal(model);
    });
  });

  describe("save", () => {
    it("creates the AjaxObservable for saving a file", () => {
      const model = {
        path: "save/to/this/path"
      };
      const create$ = contents.save(serverConfig, "/path/to/content", model);
      const request = create$.request;
      expect(request.url).to.equal(
        "http://localhost:8888/api/contents/path/to/content"
      );
      expect(request.method).to.equal("PUT");
      expect(request.body).to.deep.equal(model);
      expect(request.crossDomain).to.equal(true);
      expect(request.responseType).to.equal("json");
    });
  });
  describe("listCheckpoints", () => {
    it("creates the AjaxObservable for listing checkpoints of a file", () => {
      const create$ = contents.listCheckpoints(
        serverConfig,
        "/path/to/content"
      );
      const request = create$.request;
      expect(request.url).to.equal(
        "http://localhost:8888/api/contents/path/to/content/checkpoints"
      );
      expect(request.method).to.equal("GET");
      expect(request.crossDomain).to.equal(true);
      expect(request.responseType).to.equal("json");
    });
  });
  describe("createCheckpoint", () => {
    it("creates the AjaxObservable for", () => {
      const create$ = contents.createCheckpoint(
        serverConfig,
        "/path/to/content"
      );
      const request = create$.request;
      expect(request.url).to.equal(
        "http://localhost:8888/api/contents/path/to/content/checkpoints"
      );
      expect(request.method).to.equal("POST");
      expect(request.crossDomain).to.equal(true);
      expect(request.responseType).to.equal("json");
    });
  });
  describe("deleteCheckpoint", () => {
    it("creates the AjaxObservable for", () => {
      const create$ = contents.deleteCheckpoint(
        serverConfig,
        "/path/to/content",
        "id"
      );
      const request = create$.request;
      expect(request.url).to.equal(
        "http://localhost:8888/api/contents/path/to/content/checkpoints/id"
      );
      expect(request.method).to.equal("DELETE");
      expect(request.crossDomain).to.equal(true);
      expect(request.responseType).to.equal("json");
    });
  });
  describe("restoreFromCheckpoint", () => {
    it("creates the AjaxObservable for", () => {
      const create$ = contents.restoreFromCheckpoint(
        serverConfig,
        "/path/to/content",
        "id"
      );
      const request = create$.request;
      expect(request.url).to.equal(
        "http://localhost:8888/api/contents/path/to/content/checkpoints/id"
      );
      expect(request.method).to.equal("POST");
      expect(request.crossDomain).to.equal(true);
      expect(request.responseType).to.equal("json");
    });
  });
});
