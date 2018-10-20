import * as kernels from "../src/kernels";

const serverConfig = {
  endpoint: "http://localhost:8888",
  crossDomain: true,
  token: "secret-token"
};

describe("kernels", () => {
  describe("get", () => {
    test("creates an AjaxObservable configured for getting a kernel by id", () => {
      const id = "0000-1111-2222-3333";
      const kernel$ = kernels.get(serverConfig, id);
      const request = kernel$.request;
      expect(request.url).toBe(`http://localhost:8888/api/kernels/${id}`);
      expect(request.method).toBe("GET");
    });
  });

  describe("list", () => {
    test("creates an AjaxObservable configured for listing kernels", () => {
      const kernel$ = kernels.list(serverConfig);
      const request = kernel$.request;
      expect(request.url).toBe("http://localhost:8888/api/kernels");
      expect(request.method).toBe("GET");
      expect(request.crossDomain).toBe(true);
    });
  });

  describe("start", () => {
    test("creates an AjaxObservable configured for starting a kernel", () => {
      const kernel$ = kernels.start(serverConfig, "python3000", "/tmp");
      const request = kernel$.request;
      expect(request.url).toBe("http://localhost:8888/api/kernels");
      expect(request.headers).toEqual({
        Authorization: "token secret-token",
        "Content-Type": "application/json"
      });
      expect(request.method).toBe("POST");
      expect(request.body.path).toBe("/tmp");
      expect(request.body.name).toBe("python3000");
    });
  });

  describe("kill", () => {
    test("creates an AjaxObservable configured for killing a kernel", () => {
      const id = "0000-1111-2222-3333";
      const kernel$ = kernels.kill(serverConfig, id);
      const request = kernel$.request;
      expect(request.url).toBe(`http://localhost:8888/api/kernels/${id}`);
      expect(request.method).toBe("DELETE");
    });
  });

  describe("interrupt", () => {
    test("creates an AjaxObservable configured for interrupting a kernel", () => {
      const id = "0000-1111-2222-3333";
      const kernel$ = kernels.interrupt(serverConfig, id);
      const request = kernel$.request;
      expect(request.url).toBe(
        `http://localhost:8888/api/kernels/${id}/interrupt`
      );
      expect(request.method).toBe("POST");
    });
  });

  describe("restart", () => {
    test("creates an AjaxObservable configured for restarting a kernel", () => {
      const id = "0000-1111-2222-3333";
      const kernel$ = kernels.restart(serverConfig, id);
      const request = kernel$.request;
      expect(request.url).toBe(
        `http://localhost:8888/api/kernels/${id}/restart`
      );
      expect(request.method).toBe("POST");
    });
  });

  describe("formWebSocketURL", () => {
    test("creates websocket URLs that match the originating scheme", () => {
      const config = {
        endpoint: "https://tmp58.tmpnb.org/user/TOTefPUbkgOu"
      };
      const wsURL = kernels.formWebSocketURL(config, "0000-1111");
      expect(wsURL).toBe(
        "wss://tmp58.tmpnb.org/user/TOTefPUbkgOu/api/kernels/0000-1111/channels"
      );

      config.endpoint = "http://127.0.0.1:8888";

      const wsURL2 = kernels.formWebSocketURL(config, "4444-2222");
      expect(wsURL2).toBe("ws://127.0.0.1:8888/api/kernels/4444-2222/channels");
    });

    test("creates websocket URLs that match the originating scheme and works with tokens", () => {
      const config = {
        endpoint: "https://tmp58.tmpnb.org/user/TOTefPUbkgOu",
        token: "secret-token"
      };
      const wsURL = kernels.formWebSocketURL(config, "0000-1111");
      expect(wsURL).toBe(
        "wss://tmp58.tmpnb.org/user/TOTefPUbkgOu/api/kernels/0000-1111/channels?token=secret-token"
      );

      config.endpoint = "http://127.0.0.1:8888";

      const wsURL2 = kernels.formWebSocketURL(config, "4444-2222");
      expect(wsURL2).toBe(
        "ws://127.0.0.1:8888/api/kernels/4444-2222/channels?token=secret-token"
      );
    });
  });
});
