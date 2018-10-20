import { of } from "rxjs/observable/of";
import { Subject } from "rxjs/Subject";

// Mock response generated 01/24/2018, may need updating.
const mockListReponse = {
  default: "python3",
  kernelspecs: {
    nteract: {
      name: "nteract",
      spec: {
        argv: [
          "/Users/dtrump/venvs/nteract/bin/python",
          "-m",
          "ipykernel_launcher",
          "-f",
          "{connection_file}"
        ],
        env: {},
        display_name: "Python 3 (nteract)",
        language: "python",
        interrupt_mode: "signal",
        metadata: {}
      },
      resources: {
        "logo-32x32": "/kernelspecs/nteract/logo-32x32.png",
        "logo-64x64": "/kernelspecs/nteract/logo-64x64.png"
      }
    },
    python3: {
      name: "python3",
      spec: {
        argv: ["python", "-m", "ipykernel_launcher", "-f", "{connection_file}"],
        env: {},
        display_name: "Python 3",
        language: "python",
        interrupt_mode: "signal",
        metadata: {}
      },
      resources: {
        "logo-32x32": "/kernelspecs/python3/logo-32x32.png",
        "logo-64x64": "/kernelspecs/python3/logo-64x64.png"
      }
    }
  }
};

const kernels = {
  start: () => of({ response: { id: "0" } }),
  connect: () => new Subject(),
  interrupt: () =>
    // successful interrupt
    of({ response: null, responseType: "json", status: 204 })
};

const kernelspecs = {
  list: () => of({ response: mockListReponse })
};

const sessions = {
  create: () => of({ response: { id: "1", kernel: { id: "0" } } })
};

export { kernels, kernelspecs, sessions };
