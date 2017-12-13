export function setKernelSpecs(kernelSpecs: Object) {
  return {
    type: "SET_KERNELSPECS",
    kernelSpecs: kernelSpecs
  };
}
