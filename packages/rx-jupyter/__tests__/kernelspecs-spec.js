import * as kernelspecs from "../src/kernelspecs";

const serverConfig = {
  endpoint: "http://localhost:8888",
  crossDomain: true
};

describe("kernelspecs", () => {
  describe("list", () => {
    test("creates an AjaxObservable for listing the kernelspecs", () => {
      const kernelSpec$ = kernelspecs.list(serverConfig);
      const request = kernelSpec$.request;
      expect(request.url).toBe("http://localhost:8888/api/kernelspecs");
      expect(request.method).toBe("GET");
    });
  });

  describe("get", () => {
    test("creates an AjaxObservable for getting a kernelspec", () => {
      const kernelSpec$ = kernelspecs.get(serverConfig, "python3000");
      const request = kernelSpec$.request;
      expect(request.url).toBe(
        "http://localhost:8888/api/kernelspecs/python3000"
      );
      expect(request.method).toBe("GET");
    });
  });
});
