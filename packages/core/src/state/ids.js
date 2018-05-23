// @flow

// The *Id type is for external resources like the trailing id in:
//   /api/kernels/9092-7679-9978-8822
// ... where 9092-7679-9978-8822 is the KernelId.
//
// We call it "castTo*" to make it clear that you're not getting anything unique
// out of the function.

export opaque type HostId: string = string;
export opaque type KernelId: string = string;
export opaque type SessionId: string = string;

export const castToHostId = (id: string): HostId => id;
export const castToKernelId = (id: string): KernelId => id;
export const castToSessionId = (id: string): SessionId => id;
