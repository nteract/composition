import * as terminals from "../src/terminals";
import { AjaxObservable } from "./types";

const serverConfig = {
  endpoint: "http://localhost:8888",
  crossDomain: true,
  token: "secret-token"
};

describe("list", () => {
  test("creates an AjaxObservable for listing available terminals", () => {
    const list$ = terminals.list(serverConfig) as AjaxObservable;
    const request = list$.request;
    expect(request.url).toBe("http://localhost:8888/api/terminals/");
    expect(request.method).toBe("GET");
  });
});

describe("create", () => {
  test("creates an AjaxObservable for creating a terminal", () => {
    const create$ = terminals.create(serverConfig) as AjaxObservable;
    const request = create$.request;
    expect(request.url).toBe("http://localhost:8888/api/terminals/");
    expect(request.method).toBe("POST");
  });
});

describe("get", () => {
  test("creates an AjaxObservable for getting a terminal session", () => {
    const get$ = terminals.get(serverConfig, "1") as AjaxObservable;
    const request = get$.request;
    expect(request.url).toBe("http://localhost:8888/api/terminals/1");
    expect(request.method).toBe("GET");
  });
});

describe("destroy", () => {
  test("creates an AjaxObservable for deleting a terminal session", () => {
    const destroy$ = terminals.destroy(serverConfig, "1") as AjaxObservable;
    const request = destroy$.request;
    expect(request.url).toBe("http://localhost:8888/api/terminals/1");
    expect(request.method).toBe("DELETE");
  });
});

describe("formWebSocketURL", () => {
  test("returns a WebSocketURL for connecting to the terminal", () => {
    const url = terminals.formWebSocketURL(serverConfig, "777");
    expect(url).toBe("ws://localhost:8888/terminals/websocket/777");
  });
});
