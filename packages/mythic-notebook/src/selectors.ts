import { selectors } from "@nteract/core";
import { AppState } from "@nteract/types";
import { CellAddress } from "./types";

export const cell = (state: AppState, address: CellAddress) => {
  const model = selectors.model(state, address);
  if (model?.type !== "notebook") return null;
  return selectors.notebook.cellById(model, address);
};
