// @flow strict

export function setKernelSpecs(kernelSpecs: KernelSpecs) {
  return {
    type: "SET_KERNELSPECS",
    kernelSpecs: kernelSpecs
  };
}
