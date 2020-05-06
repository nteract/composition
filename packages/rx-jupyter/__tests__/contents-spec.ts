import { JupyterContentProvider } from "../src/contents";
import { AjaxObservable } from "./types";
import { fixtureJSON } from "@nteract/fixtures";
import { stringifyNotebook } from "@nteract/commutable";

const serverConfig = {
  endpoint: "http://localhost:8888",
  crossDomain: true,
  token: "secret-token"
};
describe("contents", () => {
  describe("remove", () => {
    test("creates the AjaxObservable for removing contents", () => {
      const remove$ = JupyterContentProvider.remove(
        serverConfig,
        "/path.ipynb"
      ) as AjaxObservable;
      const request = remove$.request;
      expect(request.url).toBe("http://localhost:8888/api/contents/path.ipynb");
      expect(request.method).toBe("DELETE");
    });
  });
  describe("get", () => {
    test("creates the AjaxObservable for getting content", () => {
      const content$ = JupyterContentProvider.get(
        serverConfig,
        "/walla/walla/bingbang.ipynb"
      ) as AjaxObservable;
      const request = content$.request;
      expect(request.url).toEqual(
        expect.stringContaining(
          "http://localhost:8888/api/contents/walla/walla/bingbang.ipynb?_="
        )
      );
      expect(request.method).toBe("GET");
      expect(request.crossDomain).toBe(true);
      expect(request.responseType).toBe("json");
    });
    test("creates the AjaxObservable for getting content with query parameters", () => {
      const content$ = JupyterContentProvider.get(serverConfig, "/walla/walla", {
        type: "directory"
      }) as AjaxObservable;
      const request = content$.request;
      expect(request.url).toEqual(
        expect.stringContaining(
          "http://localhost:8888/api/contents/walla/walla?type=directory&_="
        )
      );
      expect(request.method).toBe("GET");
      expect(request.crossDomain).toBe(true);
      expect(request.responseType).toBe("json");
    });
  });

  describe("update", () => {
    test("creates the AjaxObservable for renaming a file", () => {
      const model = { path: "renamed/path" };
      const content$ = JupyterContentProvider.update(serverConfig, "/path/to/rename", model);
      const request = (content$ as AjaxObservable).request;
      expect(request.url).toBe(
        "http://localhost:8888/api/contents/path/to/rename"
      );
      expect(request.method).toBe("PATCH");
      expect(request.body).toEqual(model);
      expect(request.crossDomain).toBe(true);
      expect(request.responseType).toBe("json");
    });
  });

  describe("create", () => {
    test("creates the AjaxObservable for creating content", () => {
      const model = {
        type: "notebook",
        name: "c.ipynb",
        writable: true,
        content: fixtureJSON,
        format: "json"
      };
      const create$ = JupyterContentProvider.create(serverConfig, "/a/b/c.ipynb", model);
      const request = (create$ as AjaxObservable).request;
      expect(request.url).toBe(
        "http://localhost:8888/api/contents/a/b/c.ipynb"
      );
      expect(request.method).toBe("POST");
      expect(request.headers).toEqual({
        Authorization: "token secret-token",
        "Content-Type": "application/json"
      });
      expect(request.body).toEqual({
        ...model,
        content: stringifyNotebook(model.content)
      });
    });
  });

  describe("save", () => {
    test("creates the AjaxObservable for saving a file", () => {
      const model = {
        path: "save/to/this/path",
        content: fixtureJSON,
        type: "notebook"
      };
      const create$ = JupyterContentProvider.save(serverConfig, "/path/to/content", model);
      const request = (create$ as AjaxObservable).request;
      expect(request.url).toBe(
        "http://localhost:8888/api/contents/path/to/content"
      );
      expect(request.method).toBe("PUT");
      expect(request.body).toEqual({
        ...model,
        content: stringifyNotebook(model.content)
      });
      expect(request.crossDomain).toBe(true);
      expect(request.responseType).toBe("json");
    });
  });
  describe("listCheckpoints", () => {
    test("creates the AjaxObservable for listing checkpoints of a file", () => {
      const create$ = JupyterContentProvider.listCheckpoints(
        serverConfig,
        "/path/to/content"
      );
      const request = (create$ as AjaxObservable).request;
      expect(request.url).toEqual(
        expect.stringContaining(
          "http://localhost:8888/api/contents/path/to/content/checkpoints?_="
        )
      );
      expect(request.method).toBe("GET");
      expect(request.crossDomain).toBe(true);
      expect(request.responseType).toBe("json");
    });
  });
  describe("createCheckpoint", () => {
    test("creates the AjaxObservable for", () => {
      const create$ = JupyterContentProvider.createCheckpoint(
        serverConfig,
        "/path/to/content"
      );
      const request = (create$ as AjaxObservable).request;
      expect(request.url).toBe(
        "http://localhost:8888/api/contents/path/to/content/checkpoints"
      );
      expect(request.method).toBe("POST");
      expect(request.crossDomain).toBe(true);
      expect(request.responseType).toBe("json");
    });
  });
  describe("deleteCheckpoint", () => {
    test("creates the AjaxObservable for", () => {
      const create$ = JupyterContentProvider.deleteCheckpoint(
        serverConfig,
        "/path/to/content",
        "id"
      );
      const request = (create$ as AjaxObservable).request;
      expect(request.url).toBe(
        "http://localhost:8888/api/contents/path/to/content/checkpoints/id"
      );
      expect(request.method).toBe("DELETE");
      expect(request.crossDomain).toBe(true);
      expect(request.responseType).toBe("json");
    });
  });
  describe("restoreFromCheckpoint", () => {
    test("creates the AjaxObservable for", () => {
      const create$ = JupyterContentProvider.restoreFromCheckpoint(
        serverConfig,
        "/path/to/content",
        "id"
      );
      const request = (create$ as AjaxObservable).request;
      expect(request.url).toBe(
        "http://localhost:8888/api/contents/path/to/content/checkpoints/id"
      );
      expect(request.method).toBe("POST");
      expect(request.crossDomain).toBe(true);
      expect(request.responseType).toBe("json");
    });
  });
});
