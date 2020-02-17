import { CellId } from "@nteract/commutable";
import { ContentRef, HostRef, KernelRef, KernelspecsRef } from "@nteract/types";
import { Subtract } from "utility-types";

export interface Action<T extends string, P = void> {
  type: T;
  payload: P;
}

export interface ErrorAction<T extends string, P extends {} | Error = Error>
  extends Action<T, P extends Error ? P : P & { error: Error }> {
  error: true;
}

export const makeActionFunction =
  <T extends Action<string, any>>
  (type: T["type"]) => {
    const func = (payload: T["payload"]) =>
      ({ type, payload });
    
    func.with = <U extends Partial<T["payload"]>>(partial: U) =>
      (payload: Subtract<T["payload"], U>) =>
        ({ type, payload: { ...partial, ...payload } as T["payload"] });

    return func;
  };

export const makeErrorActionFunction =
  <T extends ErrorAction<string, any>>
  (type: T["type"]) => (payload: T["payload"]) =>
    ({ type, payload, error: true }) as {
      type: T["type"];
      payload: T["payload"];
      error: true;
    };

export const makeOneArgActionFunction =
  <T extends Action<string, any>>(type: T["type"]) =>
    <N extends string>(name: N) =>
      (payload: T["payload"][N]) => ({ type, payload: { [name]: payload } });

export const makeZeroArgActionFunction =
  <T extends Action<string, any>>
  (type: T["type"]) => () =>
    ({ type });

export interface HasKernel { kernelRef: KernelRef }
export interface MaybeHasKernel { kernelRef?: KernelRef | null }
export interface HasContent { contentRef: ContentRef }
export interface MaybeHasContent { contentRef?: ContentRef | null }
export interface HasCell extends HasContent { id: CellId }
export interface MaybeHasCell extends HasContent { id?: CellId }
export interface HasFilepath { filepath: string; }
export interface HasFilepathChange extends HasFilepath { prevFilePath: string }
export interface HasKernelspecs { kernelspecsRef: KernelspecsRef }
export interface HasHost { hostRef: HostRef }
