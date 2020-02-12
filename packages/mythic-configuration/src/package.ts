import { createMythicPackage } from "@nteract/myths";
import { Map } from "immutable";
import { ConfigurationState } from "./types";

export const configuration =
  createMythicPackage("configuration")<ConfigurationState>({
    initialState: {
      filename: null,
      current: Map(),
    },
  });
