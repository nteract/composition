import { createMythicPackage } from "@nteract/myths";

export const configuration = createMythicPackage("configuration")<
  {
    current: any;
  }
>({
  initialState: {
    current: {},
  },
});
