// @flow
import { v4 as uuid } from "uuid";

// Note that within this file, these can all be used as `string`.
// However, _outside_ this file, they are no longer `string`, but actually the
// opaque types that we've set.
// See https://flow.org/en/docs/types/opaque-types/#toc-within-the-defining-file
export opaque type HostRef = string;
export opaque type KernelRef = string;
export opaque type KernelspecsRef = string;

export const createHostRef = (): HostRef => uuid();
export const createKernelRef = (): KernelRef => uuid();
export const createKernelspecsRef = (): KernelspecsRef => uuid();
