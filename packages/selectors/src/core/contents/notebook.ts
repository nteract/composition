import * as commutable from "@nteract/commutable";
import * as Immutable from "immutable";

import { CellId, ImmutableCell } from "@nteract/commutable";

// All these selectors expect a NotebookModel as the top level state
import { NotebookModel } from "@nteract/types";
import { createSelector } from "reselect";

/**
 * Returns the cellMap within a given NotebookModel. Returns an empty
 * Immutable.Map if no cellMap exists in the NotebookModel.
 *
 * @param   model   The notebook model to extract the cell map from
 *
 * @returns         The cell map within the notebook or an empty map
 */
export const cellMap = (model: NotebookModel) =>
  model.notebook.get("cellMap", Immutable.Map<CellId, ImmutableCell>());

/**
 * Returns the cell within a notebook with a particular ID. Returns
 * undefined if no cell with that ID is found in the model
 *
 * @param   model           The notebook model to extract the cell from
 * @param   { id: CellId }  The ID of the cell to extract
 *
 * @returns                 Undefined or a cell with the given ID
 */
export const cellById = (model: NotebookModel, { id }: { id: CellId }) =>
  cellMap(model).get(id);

/**
 * Returns the cell order within a notebook. Returns an empty list if the
 * notebook contains no cellOrder.
 *
 * @param   model   The notebook model to extract the cell order list from
 *
 * @returns         The cell order within a notebook or an empty list
 */
export const cellOrder = (model: NotebookModel): Immutable.List<CellId> =>
  model.notebook.get("cellOrder", Immutable.List<CellId>());

/**
 * Returns the ID of the focused cell within a notebook.
 *
 * @param   model   The notebook to extract the focused cell from
 *
 * @returns         The ID of the focused cell
 */
export const cellFocused = (model: NotebookModel): CellId | null | undefined =>
  model.cellFocused;

/**
 * Returns the CellId of the cell with the currently focused editor within
 * the notebook.
 *
 * @param   model   The notebook to extract the focused editor from
 *
 * @returns         The ID of the cell with the currently focused editor
 */
export const editorFocusedId = (
  model: NotebookModel
): CellId | null | undefined => model.editorFocused;

/**
 * Returns a list of CellIds above the currently focused cell in a notebook or the given cell ID.
 *
 * @param   model   The notebook to extract the code cells from
 * @param   cellId  The reference cell ID. Defaults to the currently focused cell
 *
 * @returns         The IDs of cells above the reference cell
 */
export const codeCellIdsAbove = (
  model: NotebookModel,
  cellId = model.cellFocused
): Immutable.List<CellId> => {
  if (!cellId) {
    // NOTE: if there is no reference cell, this runs none of the cells
    return Immutable.List<CellId>();
  }
  const cellOrder = model.notebook.get("cellOrder", Immutable.List<CellId>());

  const index = cellOrder.indexOf(cellId);
  return cellOrder
    .take(index)
    .filter(
      (id: string) =>
        model.notebook.getIn(["cellMap", id, "cell_type"]) === "code"
    );
};

/**
 * Returns a list of CellIds below the currently focused cell in a notebook or the given cell ID.
 *
 * @param   model   The notebook to extract the code cells from
 * @param   cellId  The reference cell ID. Defaults to the currently focused cell
 *
 * @returns         The IDs of cells below the reference cell
 */
export const codeCellIdsBelow = (
  model: NotebookModel,
  cellId = model.cellFocused
): Immutable.List<CellId> => {
  if (!cellId) {
    // NOTE: if there is no reference cell, this runs none of the cells
    return Immutable.List<CellId>();
  }
  const cellOrder = model.notebook.get("cellOrder", Immutable.List<CellId>());

  const index = cellOrder.indexOf(cellId);
  return cellOrder
    .skip(index)
    .filter(
      (id: string) =>
        model.notebook.getIn(["cellMap", id, "cell_type"]) === "code"
    );
};

/**
 * Returns the CellIds of the hidden cells in a notebook.
 */
export const hiddenCellIds = (model: NotebookModel) =>
  model.notebook.cellOrder.filter(id =>
    model.notebook.cellMap.getIn([id, "metadata", "jupyter", "source_hidden"])
  );

/**
 * Returns the CellIds of the cells with hidden outputs in the
 * notebook.
 */
export const idsOfHiddenOutputs = (model: NotebookModel) =>
  model.notebook.cellOrder.filter(id =>
    model.notebook.cellMap.getIn([id, "metadata", "jupyter", "outputs_hidden"])
  );

/**
 * Returns a transient version of the cell map within a notebook. This cell
 * map is a copy of the original cell map that is transient.
 *
 * @param   model   The notebook to extract the transient cell map from
 *
 * @returns         The tranisent cell map
 */
export const transientCellMap = (model: NotebookModel) =>
  model.transient.get("cellMap", Immutable.Map());

export const cellPromptsById = (model: NotebookModel, { id }: { id: CellId }) =>
  model.cellPrompts.get(id, Immutable.List());

/**
 * Returns the CellIds of the code cells within a notebook.
 */
export const codeCellIds = (model: NotebookModel) =>
  model.notebook.cellOrder.filter(
    id => model.notebook.cellMap.getIn([id, "cell_type"]) === "code"
  );

/**
 * Returns the metadata of a notebook. Returns an empty Immutable.Map if
 * no metadata is defined.
 *
 * @param   model   The notebook to extract the metadata from
 *
 * @returns         An empty Map or a Map containing the metadata of the notebook
 */
export const metadata = (model: NotebookModel) =>
  model.notebook.get("metadata", Immutable.Map());

/**
 * Returns the GitHub username the user has authenticated through.
 */
export const githubUsername = createSelector(metadata, metadata =>
  metadata.get("github_username", null)
);

/**
 * Returns the ID of the GitHub Gist the notebook has been recently published
 * to.
 */
export const gistId = createSelector(metadata, metadata =>
  metadata.get("gist_id", null)
);

export const notebook = (model: NotebookModel) => model.notebook;
export const savedNotebook = (model: NotebookModel) => model.savedNotebook;

/**
 * Returns true if the notebook differs from the version saved to disk, and
 * false otherwise.
 */
export const isDirty = createSelector(
  [notebook, savedNotebook],
  (original, disk) => !Immutable.is(original, disk)
);

/**
 * Returns the JSON representation of the notebook.
 */
export const asJSON = createSelector(notebook, notebook => {
  return commutable.toJS(notebook);
});

/**
 * Returns the stringified version of a notebook. Returns an empty string
 * if no notebookJS exists. Note that this is called asString instead of
 * toString so that REPLs don't think of this as the representation of this
 * module.
 */
export const asString = createSelector(asJSON, notebookJS => {
  if (notebookJS) {
    return commutable.stringifyNotebook(notebookJS);
  }
  return "";
});

/**
 * Returns the display name of the kernel the notebook is currently
 * running against.
 */
export const displayName = createSelector(metadata, metadata =>
  metadata.getIn(["kernelspec", "display_name"], "")
);
