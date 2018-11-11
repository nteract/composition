import * as sessions from "../src/sessions";
import { AjaxObservable } from "./types";

const serverConfig = {
  endpoint: "http://localhost:8888",
  crossDomain: true,
  token: "secret-token"
};

describe("sessions", () => {
  describe("list", () => {
    test("creates an AjaxObservable for listing the sessions", () => {
      const session$ = sessions.list(serverConfig) as AjaxObservable;
      const request = session$.request;
      expect(request.url).toBe("http://localhost:8888/api/sessions");
      expect(request.method).toBe("GET");
      expect(request.crossDomain).toBe(true);
      expect(request.responseType).toBe("json");
    });
  });

  describe("get", () => {
    test("creates an AjaxObservable for getting particular session info", () => {
      const session$ = sessions.get(serverConfig, "uuid") as AjaxObservable;
      const request = session$.request;
      expect(request.url).toBe("http://localhost:8888/api/sessions/uuid");
      expect(request.method).toBe("GET");
      expect(request.crossDomain).toBe(true);
      expect(request.responseType).toBe("json");
    });
  });

  describe("destroy", () => {
    test("creates an AjaxObservable for destroying a session", () => {
      const session$ = sessions.destroy(serverConfig, "uuid") as AjaxObservable;
      const request = session$.request;
      expect(request.url).toBe("http://localhost:8888/api/sessions/uuid");
      expect(request.method).toBe("DELETE");
      expect(request.crossDomain).toBe(true);
      expect(request.responseType).toBe("json");
    });
  });

  describe("rename", () => {
    test("creates an AjaxObservable for getting particular session info", () => {
      const session$ = sessions.update(serverConfig, "uuid", {
        kernel: { name: "kernel-name", id: "kernel-id" },
        name: "session-name",
        path: "~",
        type: "notebook"
      }) as AjaxObservable;
      const request = session$.request;
      expect(request.url).toBe("http://localhost:8888/api/sessions/uuid");
      expect(request.method).toBe("PATCH");
      expect(request.headers).toEqual({
        Authorization: "token secret-token",
        "Content-Type": "application/json"
      });
      expect(request.body).toEqual({
        kernel: { name: "kernel-name", id: "kernel-id" },
        name: "session-name",
        path: "~",
        type: "notebook"
      });
    });
  });

  describe("create", () => {
    test("creates an AjaxObservable for getting particular session info", () => {
      const session$ = sessions.create(serverConfig, {
        kernel: { name: "kernel-name", id: "kernel-id" },
        name: "session-name",
        path: "~",
        type: "notebook"
      }) as AjaxObservable;
      const request = session$.request;
      expect(request.url).toBe("http://localhost:8888/api/sessions");
      expect(request.method).toBe("POST");
      expect(request.headers).toEqual({
        Authorization: "token secret-token",
        "Content-Type": "application/json"
      });
      expect(request.body).toEqual({
        kernel: { name: "kernel-name", id: "kernel-id" },
        name: "session-name",
        path: "~",
        type: "notebook"
      });
    });
  });
});
