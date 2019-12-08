import {
  AppState,
  KernelspecsByRefRecord,
  KernelspecRecord
} from "@nteract/types";

/**
 * Returns a ref to the kernelspec of the kernel the nteract application
 * is currently connected to.
 *
 * @param   state   The state of the nteract application
 *
 * @returns         A ref to the kernelspec
 */
export const currentKernelspecsRef = (state: AppState) =>
  state.core.currentKernelspecsRef;

/**
 * Returns a Map of the kernelspecs associated with each kernelspec ref.
 *
 * @param state   The state of the nteract application
 *
 * @returns        An association between a kernelspec ref and the kernelspec
 */
export const kernelspecsByRef = (state: AppState) =>
  state.core.entities.kernelspecs.byRef;

/**
 * Returns the kernelspec of the kernel that the nteract application is
 * currently connected to.
 */
export const currentKernelspecs: (
  state: AppState
) => KernelspecsByRefRecord | null = (state: AppState) => {
  const ref = state.core.currentKernelspecsRef;

  if (ref) {
    const kernelspecs = state.core.entities.kernelspecs.byRef.get(ref);
    if (kernelspecs) {
      return kernelspecs;
    }
  }

  // If we don't have a current kernelspecs ref, return null
  return null;
};

export const kernelspecByName: (
  state: AppState,
  { name }: { name: string }
) => KernelspecRecord | null | undefined = (
  state: AppState,
  { name }: { name: string }
) => {
  const kernelspecs = currentKernelspecs(state);
  if (kernelspecs && kernelspecs.byName) {
    return kernelspecs.byName.get(
      name,
      kernelspecs.byName.find(
        (value: KernelspecRecord) => value.language === name
      )
    );
  }
  return null;
};
