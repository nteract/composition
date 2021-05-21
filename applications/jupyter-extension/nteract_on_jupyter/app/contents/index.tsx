// Vendor modules
import * as actions from "@nteract/actions";
import MonacoEditor from "@nteract/monaco-editor";
import { CellType, ImmutableNotebook } from "@nteract/commutable";
import { HeaderEditor } from "@nteract/connected-components";
import { NotebookMenu } from "@nteract/connected-components";
import { HeaderDataProps } from "@nteract/connected-components/lib/header-editor";
import { AppState, ContentRef, HostRecord, selectors, createKernelRef, createContentRef } from "@nteract/core";
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

// Local modules
import { ConnectedDirectory } from "./directory";
import { default as File } from "./file";
import { ConnectedFileHeader as FileHeader, DirectoryHeader } from "./headers";
import { first } from "rxjs/operators";

interface IContentsBaseProps {
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
  viewerContents: string;
}

interface IContentsState {
  isDialogOpen: boolean;
}

interface IStateToProps {
  headerData?: HeaderDataProps;
  showHeaderEditor: boolean;
}

interface IDispatchFromProps {
  handlers: any;
  onHeaderEditorChange: (props: HeaderDataProps) => void;
  onSidePanelFileSelect: () => void;
}

type ContentsProps = IContentsBaseProps & IStateToProps & IDispatchFromProps;

class Contents extends React.PureComponent<ContentsProps, IContentsState> {
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
    EXECUTE_ALL_CELLS: ["alt+r a"],
    INTERRUPT_KERNEL: ["alt+r i"],
    KILL_KERNEL: ["alt+r k"],
    OPEN: ["ctrl+o", "meta+o"],
    PASTE_CELL: ["ctrl+shift+v"],
    RESTART_KERNEL: ["alt+r r", "alt+r c", "alt+r a"],
    SAVE: ["ctrl+s", "ctrl+shift+s", "meta+s", "meta+shift+s"]
  };

  private firstRun: boolean = true;

  constructor(props: ContentsProps) {
    super(props);
    this.handleLoad = this.handleLoad.bind(this);
  }


  componentDidMount() {
    window.addEventListener('load', this.handleLoad);
  }

  componentWillUnmount() { 
    window.removeEventListener('load', this.handleLoad)  
  }

  handleLoad() {
    this.props.onSidePanelFileSelect();
  }

  render(): JSX.Element {
    const {
      appBase,
      baseDir,
      contentRef,
      contentType,
      displayName,
      error,
      handlers,
      headerData,
      loading,
      onHeaderEditorChange,
      onSidePanelFileSelect,
      saving,
      showHeaderEditor,
      viewerContents
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
                <div style={{ display: 'flex' }}>
                  <div style={{ flex: 1 }}>
                    {contentType === "notebook" ? (
                      <React.Fragment>
                        <NotebookMenu contentRef={contentRef} />
                        {showHeaderEditor ? (
                          <HeaderEditor
                            editable
                            contentRef={contentRef}
                            headerData={headerData}
                            onChange={onHeaderEditorChange}
                          />
                        ) : null}
                      </React.Fragment>
                    ) : null}
                    <File contentRef={contentRef} appBase={appBase} />
                  </div>
                  <div style={{ minWidth: '40%', borderLeft: '3px solid #22a6f1' }}>
                    <MonacoEditor
                      id="code-results-display-pane"
                      contentRef='e169379a-32ce-452d-b821-f76f8d61dd2d'
                      theme="vscode"
                      options={{
                        lineNumbers: true,
                        automaticLayout:true,
                        fixedOverflowWidgets:true,
                        scrollbar: {
                          alwaysConsumeMouseWheel: false
                        }
                      }}
                      language="java"
                      value={viewerContents}
                    />
                  </div>
                </div>
              </FileHeader>
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
  initialProps: { appBase: string; contentRef: ContentRef }
) => {
  const host: HostRecord = initialState.app.host;

  if (host.type !== "jupyter") {
    throw new Error("this component only works with jupyter apps");
  }

  const appBase: string = urljoin(host.basePath, "/nteract/edit");

  const mapStateToProps = (state: AppState): Partial<ContentsProps> => {
    const contentRef: ContentRef = initialProps.contentRef;
    
    let viewerContents = '';

    let temp = selectors.content(
      state, { contentRef: 'e169379a-32ce-452d-b821-f76f8d61dd2d' }
    );

    if (temp && temp.model && temp.model.text) {
      viewerContents = temp.model.text;
    }

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

    let showHeaderEditor: boolean = false;
    let headerData: HeaderDataProps = {
      authors: [],
      description: "",
      tags: [],
      title: ""
    };

    // If a notebook, we need to read in the headerData if available
    if (content.type === "notebook") {
      const notebook: ImmutableNotebook = content.model.get("notebook");
      const metadata: object = notebook.metadata.toJS();
      const {
        authors = [],
        description = "",
        tags = [],
        title = ""
      } = metadata;

      // Updates
      showHeaderEditor = content.showHeaderEditor;
      headerData = Object.assign({}, headerData, {
        authors,
        description,
        tags,
        title
      });
    }


    return {
      appBase,
      baseDir: dirname(content.filepath),
      contentRef,
      contentType: content.type,
      displayName: content.filepath.split("/").pop() || "",
      error: content.error,
      filepath: content.filepath,
      headerData,
      lastSavedStatement: "recently",
      loading: content.loading,
      mimetype: content.mimetype,
      saving: content.saving,
      showHeaderEditor,
      viewerContents
    };
  };

  return mapStateToProps;
};

const mapDispatchToProps = (
  dispatch: Dispatch,
  ownProps: ContentsProps
): object => {
  const { appBase, contentRef } = ownProps;



  return {
    onHeaderEditorChange: (props: HeaderDataProps) => {
      return dispatch(
        actions.overwriteMetadataFields({
          ...props,
          contentRef: ownProps.contentRef
        })
      );
    },
    onSidePanelFileSelect: () => {
      return dispatch(
        actions.fetchContent({
          filepath: 'raw-files/999990533647395383.txt',
          params: {},
          kernelRef: createKernelRef(),
          contentRef: 'e169379a-32ce-452d-b821-f76f8d61dd2d'
        })
      );
    },
    // `HotKeys` handlers object
    // see: https://github.com/greena13/react-hotkeys#defining-handlers
    handlers: {
      CHANGE_CELL_TYPE: (event: KeyboardEvent) => {
        const type: CellType = event.key === "Y" ? "code" : "markdown";
        return dispatch(actions.changeCellType({ to: type, contentRef }));
      },
      COPY_CELL: () => dispatch(actions.copyCell({ contentRef })),
      CREATE_CELL_ABOVE: () =>
        dispatch(actions.createCellAbove({ cellType: "code", contentRef })),
      CREATE_CELL_BELOW: () =>
        dispatch(
          actions.createCellBelow({ cellType: "code", source: "", contentRef })
        ),
      CUT_CELL: () => dispatch(actions.cutCell({ contentRef })),
      DELETE_CELL: () => dispatch(actions.deleteCell({ contentRef })),
      EXECUTE_ALL_CELLS: () =>
        dispatch(actions.executeAllCells({ contentRef })),
      INTERRUPT_KERNEL: () => dispatch(actions.interruptKernel({})),
      KILL_KERNEL: () => dispatch(actions.killKernel({ restarting: false })),
      OPEN: () => {
        // On initialization, the appBase prop is not available.
        const nteractEditUri = "/nteract/edit";
        const url = appBase ? urljoin(appBase, nteractEditUri) : nteractEditUri;
        window.open(url, "_blank");
      },
      PASTE_CELL: () => dispatch(actions.pasteCell({ contentRef })),
      RESTART_KERNEL: (event: KeyboardEvent) => {
        const outputHandling: "None" | "Clear All" | "Run All" =
          event.key === "r"
            ? "None"
            : event.key === "a"
              ? "Run All"
              : "Clear All";
        return dispatch(actions.restartKernel({ outputHandling, contentRef }));
      },
      SAVE: () => dispatch(actions.save({ contentRef }))
    }
  };
};

export default connect(
  makeMapStateToProps,
  mapDispatchToProps
)(Contents);
