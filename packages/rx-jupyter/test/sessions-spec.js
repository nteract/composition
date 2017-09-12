import { expect } from "chai";

import * as sessions from "../src/sessions";

const serverConfig = {
  endpoint: "http://localhost:8888",
  crossDomain: true
};

describe("sessions", () => {
  describe("list", () => {
    it("creates an AjaxObservable for listing the sessions", () => {
      const session$ = sessions.list(serverConfig);
      const request = session$.request;
      expect(request.url).to.equal("http://localhost:8888/api/sessions");
      expect(request.method).to.equal("GET");
      expect(request.crossDomain).to.equal(true);
      expect(request.responseType).to.equal("json");
    });
  });

  describe("get", () => {
    it("creates an AjaxObservable for getting particular session info", () => {
      const session$ = sessions.get(serverConfig, "uuid");
      const request = session$.request;
      expect(request.url).to.equal("http://localhost:8888/api/sessions/uuid");
      expect(request.method).to.equal("GET");
      expect(request.crossDomain).to.equal(true);
      expect(request.responseType).to.equal("json");
    });
  });

  describe("destroy", () => {
    it("creates an AjaxObservable for destroying a session", () => {
      const session$ = sessions.destroy(serverConfig, "uuid");
      const request = session$.request;
      expect(request.url).to.equal("http://localhost:8888/api/sessions/uuid");
      expect(request.method).to.equal("DELETE");
      expect(request.crossDomain).to.equal(true);
      expect(request.responseType).to.equal("json");
    });
  });

  describe("rename", () => {
    it("creates an AjaxObservable for getting particular session info", () => {
      const session$ = sessions.update(serverConfig, "uuid", {
        kernel: { name: "kernel-name", id: "kernel-id" },
        name: "session-name",
        path: "~",
        type: "notebook"
      });
      const request = session$.request;
      expect(request.url).to.equal("http://localhost:8888/api/sessions/uuid");
      expect(request.method).to.equal("PATCH");
      expect(request.headers).to.deep.equal({
        "Content-Type": "application/json"
      });
      expect(request.body).to.deep.equal({
        kernel: { name: "kernel-name", id: "kernel-id" },
        name: "session-name",
        path: "~",
        type: "notebook"
      });
    });
  });

  describe("create", () => {
    it("creates an AjaxObservable for getting particular session info", () => {
      const session$ = sessions.create(serverConfig, {
        kernel: { name: "kernel-name", id: "kernel-id" },
        name: "session-name",
        path: "~",
        type: "notebook"
      });
      const request = session$.request;
      expect(request.url).to.equal("http://localhost:8888/api/sessions");
      expect(request.method).to.equal("POST");
      expect(request.headers).to.deep.equal({
        "Content-Type": "application/json"
      });
      expect(request.body).to.deep.equal({
        kernel: { name: "kernel-name", id: "kernel-id" },
        name: "session-name",
        path: "~",
        type: "notebook"
      });
    });
  });
});
