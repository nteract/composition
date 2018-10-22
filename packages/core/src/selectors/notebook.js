// @flow
import * as Immutable from "immutable";
import * as commutable from "@nteract/commutable";
import type { CellID } from "@nteract/commutable";
import { createSelector } from "reselect";

// All these selectors expect a NotebookModel as the top level state
import type { NotebookModel } from "../state/entities/contents/notebook";

export const cellMap = (model: NotebookModel) =>
  model.notebook.get("cellMap", Immutable.Map());

export const cellById = (model: NotebookModel, { id }: { id: CellID }) =>
  cellMap(model).get(id);

export const cellOrder = (model: NotebookModel): Immutable.List<CellID> =>
  model.notebook.get("cellOrder", Immutable.List());

export const cellFocused = (model: NotebookModel): ?CellID => model.cellFocused;
export const editorFocusedId = (model: NotebookModel): ?CellID =>
  model.editorFocused;

export const codeCellIdsBelow = (model: NotebookModel) => {
  const cellFocused = model.cellFocused;
  if (!cellFocused) {
    // NOTE: if there is no focused cell, this runs none of the cells
    return Immutable.List();
  }
  const cellOrder = model.notebook.get("cellOrder", Immutable.List());

  const index = cellOrder.indexOf(cellFocused);
  return cellOrder
    .skip(index)
    .filter(
      id => model.notebook.getIn(["cellMap", id, "cell_type"]) === "code"
    );
};

export const hiddenCellIds = createSelector(
  [cellMap, cellOrder],
  (cellMap, cellOrder) => {
    return cellOrder.filter(id =>
      cellMap.getIn([id, "metadata", "inputHidden"])
    );
  }
);

export const idsOfHiddenOutputs = createSelector(
  [cellMap, cellOrder],
  (cellMap, cellOrder): Immutable.List<any> => {
    if (!cellOrder || !cellMap) {
      return Immutable.List();
    }

    return cellOrder.filter(cellId =>
      cellMap.getIn([cellId, "metadata", "outputHidden"])
    );
  }
);

export const transientCellMap = (model: NotebookModel) =>
  model.transient.get("cellMap", Immutable.Map());

export const codeCellIds = createSelector(
  [cellMap, cellOrder],
  (cellMap, cellOrder) => {
    return cellOrder.filter(id => cellMap.getIn([id, "cell_type"]) === "code");
  }
);

export const metadata = (model: NotebookModel) =>
  model.notebook.get("metadata", Immutable.Map());

export const githubUsername = createSelector([metadata], metadata =>
  metadata.get("github_username", null)
);

export const gistId = createSelector([metadata], metadata =>
  metadata.get("gist_id", null)
);

export const notebook = (model: NotebookModel) => model.notebook;
export const savedNotebook = (model: NotebookModel) => model.savedNotebook;

export const isDirty = createSelector(
  notebook,
  savedNotebook,
  (original, disk) => !Immutable.is(original, disk)
);

export const asJSON = createSelector([notebook], notebook => {
  return commutable.toJS(notebook);
});

// NOTE: This is called asString instead of toString so that REPLs
//       don't think of this as the representation of this module
export const asString = createSelector([asJSON], notebookJS => {
  if (notebookJS) {
    return commutable.stringifyNotebook(notebookJS);
  }
  return "";
});

const CODE_MIRROR_MODE_DEFAULT = "text";

export const codeMirrorMode = createSelector(
  metadata,
  metadata =>
    metadata.getIn(["language_info", "codemirror_mode"]) ||
    metadata.getIn(["kernel_info", "language"]) ||
    metadata.getIn(["kernelspec", "language"]) ||
    CODE_MIRROR_MODE_DEFAULT
);

export const displayName = createSelector([metadata], metadata =>
  metadata.getIn(["kernelspec", "display_name"], "")
);
