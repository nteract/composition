import { expect } from "chai";

import * as jupyter from "../src";

describe("rx-jupyter", () => {
  // Mostly a dummy "have we exported all the things" test
  it("exports kernels and kernelspecs", () => {
    expect(jupyter.kernels).to.not.be.null; // eslint-disable-line no-unused-expressions
    expect(jupyter.kernelspecs).to.not.be.null; // eslint-disable-line no-unused-expressions
  });

  describe("apiVersion", () => {
    it("creates an AjaxObservable for getting the notebook server version", () => {
      const apiVersion$ = jupyter.apiVersion({
        endpoint: "https://somewhere.com",
        crossDomain: true
      });
      const request = apiVersion$.request;
      expect(request.url).to.equal("https://somewhere.com/api");
      expect(request.method).to.equal("GET");
    });
  });
  describe("shutdown", () => {
    it(" Creates an AjaxObservable for shutting down a notebook server", () => {
      const shutdown$ = jupyter.shutdown({
        endpoint: "https://somewhere.com",
        crossDomain: true
      });
      const request = shutdown$.request;
      expect(request.url).to.equal("https://somewhere.com/api/shutdown");
      expect(request.method).to.equal("POST");
    });
  });
});
