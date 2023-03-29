import { ContentRef } from "@nteract/types";
export { ContentRef } from "@nteract/types";

export type CellId = string;

export interface CellAddress {
  id:         CellId;
  contentRef: ContentRef;
}

export const cellAddressToIndex = (address: CellAddress) =>
  `${address.contentRef}:${address.id}`;
