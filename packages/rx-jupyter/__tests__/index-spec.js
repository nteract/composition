import * as jupyter from "../src";

describe("rx-jupyter", () => {
  // Mostly a dummy "have we exported all the things" test
  test("exports kernels and kernelspecs", () => {
    expect(jupyter.kernels).not.toBeNull(); // eslint-disable-line no-unused-expressions
    expect(jupyter.kernelspecs).not.toBeNull(); // eslint-disable-line no-unused-expressions
  });

  describe("apiVersion", () => {
    test("creates an AjaxObservable for getting the notebook server version", () => {
      const apiVersion$ = jupyter.apiVersion({
        endpoint: "https://somewhere.com",
        crossDomain: true
      });
      const request = apiVersion$.request;
      expect(request.url).toBe("https://somewhere.com/api");
      expect(request.method).toBe("GET");
    });
  });
  describe("shutdown", () => {
    test(" Creates an AjaxObservable for shutting down a notebook server", () => {
      const shutdown$ = jupyter.shutdown({
        endpoint: "https://somewhere.com",
        crossDomain: true
      });
      const request = shutdown$.request;
      expect(request.url).toBe("https://somewhere.com/api/shutdown");
      expect(request.method).toBe("POST");
    });
  });
});
