import { expect } from "chai";

import * as terminals from "../src/terminals";

const serverConfig = {
  endpoint: "http://localhost:8888",
  crossDomain: true
};

describe("list", () => {
  it("creates an AjaxObservable for listing available terminals", () => {
    const list$ = terminals.list(serverConfig);
    const request = list$.request;
    expect(request.url).to.equal("http://localhost:8888/api/terminals/");
    expect(request.method).to.equal("GET");
  });
});

describe("create", () => {
  it("creates an AjaxObservable for creating a terminal", () => {
    const create$ = terminals.create(serverConfig);
    const request = create$.request;
    expect(request.url).to.equal("http://localhost:8888/api/terminals/");
    expect(request.method).to.equal("POST");
  });
});

describe("get", () => {
  it("creates an AjaxObservable for getting a terminal session", () => {
    const get$ = terminals.get(serverConfig, "1");
    const request = get$.request;
    expect(request.url).to.equal("http://localhost:8888/api/terminals/1");
    expect(request.method).to.equal("GET");
  });
});

describe("destroy", () => {
  it("creates an AjaxObservable for deleting a terminal session", () => {
    const destroy$ = terminals.destroy(serverConfig, "1");
    const request = destroy$.request;
    expect(request.url).to.equal("http://localhost:8888/api/terminals/1");
    expect(request.method).to.equal("DELETE");
  });
});

describe("formWebSocketURL", () => {
  it("returns a WebSocketURL for connecting to the terminal", () => {
    const url = terminals.formWebSocketURL(serverConfig, "777");
    expect(url).to.equal("ws://localhost:8888/terminals/websocket/777");
  });
});
