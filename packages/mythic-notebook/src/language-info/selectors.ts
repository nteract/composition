import { AppState } from "@nteract/types";
import { cell } from "../selectors";
import { CellAddress, cellAddressToIndex } from "../types";
import { languageData } from "./data/languages";
import { languageInfo } from "./package";
import { HasPrivateLanguageInfoState } from "./types";

export const lineWrappingOfCell = (state: AppState, address: CellAddress) =>
  cell(state, address)?.cell_type !== "code";

const lookupCodeCell = languageInfo.createSelector(
  state => (address: CellAddress) =>
    state?.langBy.cell[cellAddressToIndex(address)]
    ?? state?.langBy.content[address.contentRef]
);

const lookupCodeCellOnly = languageInfo.createSelector(
  state => (address: CellAddress) =>
    state?.langBy.cell[cellAddressToIndex(address)]
);

const lookupCodeCellText = languageInfo.createSelector(
  state => (address: CellAddress) =>
    state?.textBy.cell[cellAddressToIndex(address)]
);

export const languageOfCellOnly = (state: AppState & HasPrivateLanguageInfoState, address: CellAddress) => {
  switch (cell(state, address)?.cell_type) {
    case "markdown":  return "Markdown";
    case "code":      return lookupCodeCellText(state)?.(address) === undefined
      ? "Use Document Language"
      : (lookupCodeCellOnly(state)?.(address) ?? "Unknown");
    default:          return "Text";
  }
};

export const languageOfCell = (state: AppState & HasPrivateLanguageInfoState, address: CellAddress) => {
  switch (cell(state, address)?.cell_type) {
    case "markdown":  return "Markdown";
    case "code":      return lookupCodeCell(state)?.(address) ?? "Text";
    default:          return "Text";
  }
};

export const modeOfCell = (state: AppState & HasPrivateLanguageInfoState, address: CellAddress, editor: string) =>
  languageData["editor"][editor][languageOfCell(state, address)];
