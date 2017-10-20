import * as actions from "../../src/main/actions";

describe("setKernelSpecs", () => {
  test("creates a SET_KERNELSPECS action", () => {
    const kernelSpecs = {
      python3: {
        files: [
          "/usr/local/share/jupyter/kernels/python3/kernel.json",
          "/usr/local/share/jupyter/kernels/python3/logo-32x32.png",
          "/usr/local/share/jupyter/kernels/python3/logo-64x64.png"
        ],
        resources_dir: "/usr/local/share/jupyter/kernels/python3",
        spec: { language: "python", display_name: "Python 3", argv: [Object] }
      },
      javascript: {
        files: [
          "/Users/rgbkrk/Library/Jupyter/kernels/javascript/kernel.json",
          "/Users/rgbkrk/Library/Jupyter/kernels/javascript/logo-32x32.png",
          "/Users/rgbkrk/Library/Jupyter/kernels/javascript/logo-64x64.png"
        ],
        resources_dir: "/Users/rgbkrk/Library/Jupyter/kernels/javascript",
        spec: {
          argv: [Object],
          display_name: "Javascript (Node.js)",
          language: "javascript"
        }
      }
    };
    expect(actions.setKernelSpecs(kernelSpecs)).toEqual({
      type: "SET_KERNELSPECS",
      kernelSpecs: kernelSpecs
    });
  });
});
