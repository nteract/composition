// @flow
import uuid from "uuid/v4";

// TODO: this is a little odd that we have code inside a `/types` directory. The
// reason is to allow strict typing for these ref functions.

// Note that within this file, these can all be used as `string`.
// However, _outside_ this file, they are no longer `string`, but actually the
// opaque types that we've set.
// See https://flow.org/en/docs/types/opaque-types/#toc-within-the-defining-file
export opaque type HostRef: string = string;
export opaque type KernelRef: string = string;
export opaque type KernelspecsRef: string = string;
export opaque type ContentRef: string = string;

export const createHostRef = (): HostRef => uuid();
export const createKernelRef = (): KernelRef => uuid();
export const createKernelspecsRef = (): KernelspecsRef => uuid();
export const createContentRef = (): ContentRef => uuid();
