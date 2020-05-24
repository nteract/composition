import { AppState, ContentRef, KernelRef } from "@nteract/types";

/**
 * Returns the contents, such as notebooks and files, that are currently accessible
 * within the current notebook application.
 *
 * @param   state   The state of the nteract application
 *
 * @returns         The contents in scope by the nteract application by ID
 */
export const contentByRef = (state: AppState) =>
  state.core.entities.contents.byRef;

/**
 *
 * @param   state                       The state of the nteract application
 * @param   { contentRef: ContentRef }  A reference to the ContentRecord to retrieve
 *
 * @returns                             The ContentRecord for the given ref
 */
export const content = (
  state: AppState,
  { contentRef }: { contentRef: ContentRef }
) => contentByRef(state).get(contentRef);

/**
 * Returns the model within the ContenteRecrd specified by contentRef.
 * For example, if the ContentRecord is a reference to a notebook object,
 * the model would contain the NotebookModel.
 *
 * @param   state                       The state of the nteract application
 * @param   { contentRef: ContentRef }  A reference to the ContentRecord to retrieve
 *
 * @returns                             The model of the content under the current ref
 */
export const model = (
  state: AppState,
  { contentRef }: { contentRef: ContentRef }
) => {
  const content = contentByRef(state).get(contentRef);
  if (!content) {
    return null;
  }
  return content.model;
};

export const notebookModel = (
  state: AppState,
  { contentRef }: { contentRef: ContentRef }
) => {
  const notebook = model(state, { contentRef });

  if (!notebook || notebook.type !== "notebook") {
    throw new Error("Expected notebook model");
  }

  return notebook;
};

/**
 * Returns a ref to the kernel associated with a particular type of content.
 * Currently, this only support kernels associated with notebook contents.
 * Returns null if there are no contents or if the contents are not
 * a notebook.
 *
 * @param   state                       The state of the nteract application
 * @param   { contentRef: ContentRef }  A reference to the ContentRecord to retrieve
 *
 * @returns                             The kernel associated with a notebook
 */
export const kernelRefByContentRef = (
  state: AppState,
  ownProps: { contentRef: ContentRef }
): KernelRef | null | undefined => {
  const c = content(state, ownProps);
  if (c && c.model && c.model.type === "notebook") {
    return c.model.kernelRef;
  }

  return null;
};

/*
 * Returns the kernel associated with the current ContentRef.
 */
export const kernelByContentRef = (
  state: AppState,
  ownProps: { contentRef: ContentRef }
) => {
  const kernelRef = kernelRefByContentRef(state, ownProps);
  if (kernelRef) {
    return state.core.entities.kernels.byRef.get(kernelRef);
  }

  return null;
};

/**
 * Returns the filepath for the content identified by a given ContentRef.
 *
 * @param   state     The state of the nteract application
 * @param   ownProps  An object containing the ContentRef
 *
 * @returns           The filepath for the content
 */
export const filepath = (
  state: AppState,
  ownProps: { contentRef: ContentRef }
): string | null => {
  const c = content(state, ownProps);
  if (!c) {
    return null;
  }
  return c.filepath;
};

/**
 * Returns the ContentRef associated with a given filepath.
 *
 * @param   state       The state of the nteract application
 * @param   ownProps    An object containing the filepath
 *
 * @returns             The ContentRef for the content under a filepath
 */
export const contentRefByFilepath = (
  state: AppState,
  ownProps: { filepath: string }
): string | undefined => {
  const byRef = contentByRef(state);
  return byRef.findKey(content => content.filepath === ownProps.filepath);
};
