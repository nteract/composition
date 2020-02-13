import { CellType } from "@nteract/commutable";
import { actions } from "@nteract/core";
import { setTheme } from "@nteract/mythic-configuration";
import { AppState, ContentRef, HostRecord, KernelRef, KernelspecsByRefRecordProps, KernelspecsRef } from "@nteract/types";
import { RecordOf } from "immutable";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { MODAL_TYPES } from "../modal-controller";
import PureNotebookMenu from "./PureNotebookMenu";

export function makeMapStateToProps(
  initialState: AppState,
  initialProps: { contentRef: ContentRef }
) {
  const { contentRef } = initialProps;

  const currentContentRef = contentRef;

  const mapStateToProps = (state: AppState) => {
    const content = state.core.entities.contents.byRef.get(contentRef);
    const host: HostRecord = state.app.host;
    const isBookstoreEnabled: boolean = host.bookstoreEnabled || false;

    // The current kernelspecs setup is _overkill_ as we're only ever going to
    // have one collection of kernelspecs

    const currentKernelspecsRef: KernelspecsRef | null =
      state.core.currentKernelspecsRef || null;
    const currentKernelspecs: RecordOf<
      KernelspecsByRefRecordProps
    > | null = currentKernelspecsRef
      ? state.core.entities.kernelspecs.byRef.get(currentKernelspecsRef, null)
      : null;

    // This menu should only work for notebooks
    if (!content || content.type !== "notebook") {
      return {
        currentContentRef,
        currentKernelRef: null,
        currentKernelspecs,
        currentKernelspecsRef
      };
    }

    const currentKernelRef = content.model.kernelRef;

    return {
      bookstoreEnabled: isBookstoreEnabled,
      currentContentRef,
      currentKernelRef,
      currentKernelspecs,
      currentKernelspecsRef
    };
  };

  return mapStateToProps;
}

export function makeMapDispatchToProps(
  initialDispatch: Dispatch,
  initialProps: { contentRef: ContentRef }
) {
  const mapDispatchToProps = (dispatch: Dispatch) => ({
    onPublish: (payload: { contentRef: string }) =>
      dispatch(actions.publishToBookstore(payload)),
    toggleNotebookHeaderEditor: (payload: { contentRef: string }) =>
      dispatch(actions.toggleHeaderEditor(payload)),
    saveNotebook: (payload: { contentRef: string }) =>
      dispatch(actions.save(payload)),
    downloadNotebook: (payload: { contentRef: string }) =>
      dispatch(actions.downloadContent(payload)),
    executeCell: (payload: { id: string; contentRef: string }) =>
      dispatch(actions.executeCell(payload)),
    executeAllCells: (payload: { contentRef: string }) =>
      dispatch(actions.executeAllCells(payload)),
    executeAllCellsBelow: (payload: { contentRef: string }) =>
      dispatch(actions.executeAllCellsBelow(payload)),
    clearAllOutputs: (payload: { contentRef: string }) =>
      dispatch(actions.clearAllOutputs(payload)),
    unhideAll: (payload: {
      outputHidden: boolean;
      inputHidden: boolean;
      contentRef: string;
    }) => dispatch(actions.unhideAll(payload)),
    cutCell: (payload: { id?: string; contentRef: string }) =>
      dispatch(actions.cutCell(payload)),
    copyCell: (payload: { id?: string; contentRef: string }) =>
      dispatch(actions.copyCell(payload)),
    pasteCell: (payload: { contentRef: string }) =>
      dispatch(actions.pasteCell(payload)),
    createCellBelow: (payload: {
      id?: string | undefined;
      cellType: CellType;
      source: string;
      contentRef: string;
    }) => dispatch(actions.createCellBelow(payload)),
    changeCellType: (payload: {
      id?: string | undefined;
      to: CellType;
      contentRef: string;
    }) => dispatch(actions.changeCellType(payload)),
    setTheme: (theme: string) => dispatch(setTheme(theme)),
    openAboutModal: () =>
      dispatch(actions.openModal({ modalType: MODAL_TYPES.ABOUT })),
    changeKernelByName: (payload: {
      kernelSpecName: any;
      oldKernelRef?: string | null;
      contentRef: string;
    }) => dispatch(actions.changeKernelByName(payload)),
    restartKernel: (payload: {
      outputHandling: actions.RestartKernelOutputHandling;
      kernelRef?: string | null;
      contentRef: string;
    }) => dispatch(actions.restartKernel(payload)),
    restartKernelAndClearOutputs: (payload: {
      kernelRef?: string | null;
      contentRef: string;
    }) =>
      dispatch(
        actions.restartKernel({ ...payload, outputHandling: "Clear All" })
      ),
    restartKernelAndRunAllOutputs: (payload: {
      kernelRef?: string | null;
      contentRef: string;
    }) =>
      dispatch(
        actions.restartKernel({ ...payload, outputHandling: "Run All" })
      ),
    killKernel: (payload: { restarting: boolean; kernelRef?: string | null }) =>
      dispatch(actions.killKernel(payload)),
    interruptKernel: (payload: {
      kernelRef?: KernelRef | null;
      contentRef?: ContentRef | null;
    }) => dispatch(actions.interruptKernel(payload))
  });
  return mapDispatchToProps;
}

export const NotebookMenu = connect(
  makeMapStateToProps,
  makeMapDispatchToProps
)(PureNotebookMenu);

// We export this for testing purposes.
export { PureNotebookMenu };

export default NotebookMenu;
