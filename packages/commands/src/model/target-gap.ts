import { AppState, ContentRef } from "@nteract/core";
import { CommandSet } from "./command";

export interface GapTarget {
  contentRef: ContentRef;
  id?: string;
}

export interface GapInfo {
  isLastGap: boolean;
}

export type GapCommandSets = Array<CommandSet<GapTarget, GapInfo>>;

export const makeGapInfo =
  (model?: GapTarget): GapInfo => ({
    isLastGap: model ? model.id === undefined : false,
  });

export const makeGapModel =
  (_state: AppState, target: GapTarget): GapTarget | undefined =>
    target;
