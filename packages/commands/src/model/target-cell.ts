import { CellType, ImmutableCell } from "@nteract/commutable";
import { AppState, ContentRef, selectors } from "@nteract/core";
import * as Immutable from "immutable";
import { CommandSet } from "./command";

export interface CellTarget {
  contentRef: ContentRef;
  id: string;
}

export interface CellInfo {
  type?: CellType;
  list: (...path: string[]) => Immutable.List<any>;
  metadata: Immutable.Map<string, any>;
  tags: Immutable.Set<string>;
}

export const makeCellInfo = (cell?: ImmutableCell): CellInfo => ({
  type: cell ? cell.cell_type : undefined,
  list: (...path: string[]) => (cell && cell.getIn(path)) || Immutable.List(),
  metadata: (cell && cell.get("metadata")) || Immutable.Map(),
  tags: (cell && cell.getIn(["metadata", "tags"])) || Immutable.Set(),
});

export type CellCommandSets = Array<CommandSet<CellTarget, CellInfo>>;

export const makeCellModelFromState =
  (state: AppState, target: CellTarget): ImmutableCell | undefined => {
    const notebook = selectors.model(state, target);

    if (!notebook || notebook.type !== "notebook") {
      return undefined;
    }

    return selectors.notebook.cellById(notebook, target);
  };
