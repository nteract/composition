import * as actions from "@nteract/actions";
import { CellType } from "@nteract/commutable";
import { AppState, ContentRef, HostRecord, selectors } from "@nteract/core";
import {
  DirectoryContentRecordProps,
  DummyContentRecordProps,
  FileContentRecordProps,
  NotebookContentRecordProps
} from "@nteract/types";
import { RecordOf } from "immutable";
import { dirname } from "path";
import * as React from "react";
import { HotKeys, KeyMap } from "react-hotkeys";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import urljoin from "url-join";

import { ConnectedDirectory } from "./directory";
import { default as File } from "./file";
import { ConnectedFileHeader as FileHeader, DirectoryHeader } from "./headers";

import { NotebookMenu as OldNotebookMenu } from "@nteract/connected-components";

import { NotebookMenu } from "./notebook-menu";

interface IContentsProps {
  appBase: string;
  baseDir: string;
  contentType: "dummy" | "notebook" | "directory" | "file";
  contentRef: ContentRef;
  displayName: string;
  error?: object | null;
  filepath: string | undefined;
  lastSavedStatement: string;
  loading: boolean;
  mimetype?: string | null;
  saving: boolean;
}

interface IContentsState {
  isDialogOpen: boolean;
}
interface IDispatchFromProps {
  handlers: any;
}

class Contents extends React.PureComponent<
  IContentsProps & IDispatchFromProps,
  IContentsState
> {
  private keyMap: KeyMap = {
    CHANGE_CELL_TYPE: [
      "ctrl+shift+y",
      "ctrl+shift+m",
      "meta+shift+y",
      "meta+shift+m"
    ],
    COPY_CELL: ["ctrl+shift+c", "meta+shift+c"],
    CREATE_CELL_ABOVE: ["ctrl+shift+a", "meta+shift+a"],
    CREATE_CELL_BELOW: ["ctrl+shift+b", "meta+shift+b"],
    CUT_CELL: ["ctrl+shift+x", "meta+shift+x"],
    DELETE_CELL: ["ctrl+shift+d", "meta+shift+d"],
    EXECUTE_ALL_CELLS: "alt+r a",
    INTERRUPT_KERNEL: "alt+r i",
    KILL_KERNEL: "alt+r k",
    PASTE_CELL: ["ctrl+shift+v", "meta+shift+v"],
    RESTART_KERNEL: ["alt+r r", "alt+r c", "alt+r a"],
    SAVE: ["ctrl+s", "ctrl+shift+s", "meta+s", "meta+shift+s"]
  };

  render(): JSX.Element {
    const {
      appBase,
      baseDir,
      contentRef,
      contentType,
      displayName,
      error,
      handlers,
      loading,
      saving
    } = this.props;

    switch (contentType) {
      case "notebook":
      case "file":
      case "dummy":
        return (
          <React.Fragment>
            <HotKeys keyMap={this.keyMap} handlers={handlers}>
              <FileHeader
                appBase={appBase}
                baseDir={baseDir}
                contentRef={contentRef}
                displayName={displayName}
                error={error}
                loading={loading}
                saving={saving}
              >
                {contentType === "notebook" ? (
                  <>
                    <OldNotebookMenu contentRef={this.props.contentRef} />
                    <NotebookMenu contentRef={this.props.contentRef} />
                  </>
                ) : null}
              </FileHeader>
              <File contentRef={contentRef} appBase={appBase} />
            </HotKeys>
          </React.Fragment>
        );
      case "directory":
        return (
          <React.Fragment>
            <DirectoryHeader appBase={appBase} />
            <ConnectedDirectory appBase={appBase} contentRef={contentRef} />
          </React.Fragment>
        );
      default:
        return (
          <React.Fragment>
            <DirectoryHeader appBase={appBase} />
            <div>{`content type ${contentType} not implemented`}</div>
          </React.Fragment>
        );
    }
  }
}

const makeMapStateToProps: any = (
  initialState: AppState,
  initialProps: { contentRef: ContentRef }
) => {
  const host: HostRecord = initialState.app.host;

  if (host.type !== "jupyter") {
    throw new Error("this component only works with jupyter apps");
  }

  const appBase: string = urljoin(host.basePath, "/nteract/edit");

  const mapStateToProps = (state: AppState) => {
    const contentRef: ContentRef = initialProps.contentRef;

    if (!contentRef) {
      throw new Error("cant display without a contentRef");
    }

    const content:
      | RecordOf<NotebookContentRecordProps>
      | RecordOf<DummyContentRecordProps>
      | RecordOf<FileContentRecordProps>
      | RecordOf<DirectoryContentRecordProps>
      | undefined = selectors.content(state, { contentRef });

    if (!content) {
      throw new Error("need content to view content, check your contentRefs");
    }

    return {
      appBase,
      baseDir: dirname(content.filepath),
      contentRef,
      contentType: content.type,
      displayName: content.filepath.split("/").pop() || "",
      error: content.error,
      filepath: content.filepath,
      lastSavedStatement: "recently",
      loading: content.loading,
      mimetype: content.mimetype,
      saving: content.saving
    };
  };

  return mapStateToProps;
};

const mapDispatchToProps = (
  dispatch: Dispatch,
  initialProps: {
    contentRef: ContentRef;
  }
) => ({
  // `HotKeys` handlers object
  // see: https://github.com/greena13/react-hotkeys#defining-handlers
  handlers: {
    CHANGE_CELL_TYPE: (event: KeyboardEvent) => {
      const type: CellType = event.key === "Y" ? "code" : "markdown";

      return dispatch(
        actions.changeCellType({
          to: type,
          contentRef: initialProps.contentRef
        })
      );
    },
    COPY_CELL: () =>
      dispatch(actions.copyCell({ contentRef: initialProps.contentRef })),
    CREATE_CELL_ABOVE: () =>
      dispatch(
        actions.createCellAbove({
          cellType: "code",
          contentRef: initialProps.contentRef
        })
      ),
    CREATE_CELL_BELOW: () =>
      dispatch(
        actions.createCellBelow({
          cellType: "code",
          source: "",
          contentRef: initialProps.contentRef
        })
      ),
    CUT_CELL: () =>
      dispatch(actions.cutCell({ contentRef: initialProps.contentRef })),
    DELETE_CELL: () =>
      dispatch(actions.deleteCell({ contentRef: initialProps.contentRef })),
    EXECUTE_ALL_CELLS: () =>
      dispatch(
        actions.executeAllCells({ contentRef: initialProps.contentRef })
      ),
    INTERRUPT_KERNEL: () => dispatch(actions.interruptKernel({})),
    KILL_KERNEL: () =>
      dispatch(
        actions.killKernel({
          restarting: false
        })
      ),
    PASTE_CELL: () =>
      dispatch(actions.pasteCell({ contentRef: initialProps.contentRef })),
    RESTART_KERNEL: (event: KeyboardEvent) => {
      const outputHandling: "None" | "Clear All" | "Run All" =
        event.key === "r"
          ? "None"
          : event.key === "a"
          ? "Run All"
          : "Clear All";

      return dispatch(
        actions.restartKernel({
          outputHandling,
          contentRef: initialProps.contentRef
        })
      );
    },
    SAVE: () => dispatch(actions.save({ contentRef: initialProps.contentRef }))
  }
});

export default connect<IContentsProps, IDispatchFromProps, any>(
  makeMapStateToProps,
  mapDispatchToProps
)(Contents);
