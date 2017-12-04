// @flow
export const IOPUB = "iopub";
export const STDIN = "stdin";
export const SHELL = "shell";
export const CONTROL = "control";

export const DEALER = "dealer";
export const SUB = "sub";

export const ZMQType = {
  frontend: {
    iopub: SUB,
    stdin: DEALER,
    shell: DEALER,
    control: DEALER
  }
};
