// Vendor modules
import {
  IMenuItemProps,
  Menu,
  MenuDivider,
  MenuItem,
  PopoverInteractionKind,
  Position
} from "@blueprintjs/core";
import { CellType } from "@nteract/commutable";
import { actions } from "@nteract/core";
import {
  ContentRef,
  KernelRef,
  KernelspecsByRefRecord,
  KernelspecsRef
} from "@nteract/types";
import React, { CSSProperties, SyntheticEvent } from "react";

// Local modules
import { IconNames } from "@blueprintjs/icons";
import { MENU_ITEM_ACTIONS, MENU_ITEM_LABELS } from "./constants";

const {
  TOGGLE_EDITOR,
  SAVE_NOTEBOOK,
  DOWNLOAD_NOTEBOOK,
  COPY_CELL,
  CUT_CELL,
  PASTE_CELL,
  CREATE_CODE_CELL,
  CREATE_MARKDOWN_CELL,
  SET_CELL_TYPE_CODE,
  SET_CELL_TYPE_MARKDOWN,
  EXECUTE_ALL_CELLS,
  EXECUTE_ALL_CELLS_BELOW,
  UNHIDE_ALL,
  CLEAR_ALL_OUTPUTS,
  SET_THEME_DARK,
  SET_THEME_LIGHT,
  OPEN_ABOUT,
  INTERRUPT_KERNEL,
  RESTART_KERNEL,
  RESTART_AND_CLEAR_OUTPUTS,
  RESTART_AND_RUN_ALL_OUTPUTS,
  KILL_KERNEL,
  CHANGE_KERNEL,
  PUBLISH_TO_BOOKSTORE
} = MENU_ITEM_ACTIONS;

export interface PureNotebookMenuProps {
  /**
   * Whether or not `Bookstore` is enabled
   * https://github.com/nteract/bookstore#bookstore-books
   */
  bookstoreEnabled?: boolean;
  currentKernelRef?: KernelRef | null;
  toggleNotebookHeaderEditor?: (payload: { contentRef: string }) => void;
  saveNotebook?: (payload: { contentRef: string }) => void;
  downloadNotebook?: (payload: { contentRef: string }) => void;
  executeCell?: (payload: { id: string; contentRef: string }) => void;
  executeAllCells?: (payload: { contentRef: string }) => void;
  executeAllCellsBelow?: (payload: { contentRef: string }) => void;
  clearAllOutputs?: (payload: { contentRef: string }) => void;
  unhideAll?: (payload: {
    outputHidden: boolean;
    inputHidden: boolean;
    contentRef: string;
  }) => void;
  cutCell?: (payload: { id?: string; contentRef: string }) => void;
  copyCell?: (payload: { id?: string; contentRef: string }) => void;
  pasteCell?: (payload: { contentRef: string }) => void;
  createCellBelow?: (payload: {
    id?: string | undefined;
    cellType: CellType;
    source: string;
    contentRef: string;
  }) => void;
  changeCellType?: (payload: {
    id?: string | undefined;
    to: CellType;
    contentRef: string;
  }) => void;
  setTheme?: (theme: string) => void;
  openAboutModal?: () => void;
  changeKernelByName?: (payload: {
    kernelSpecName: string;
    oldKernelRef?: KernelRef | null;
    contentRef: ContentRef;
  }) => void;
  restartKernel?: (payload: {
    outputHandling: actions.RestartKernelOutputHandling;
    kernelRef?: string | null;
    contentRef: string;
  }) => void;
  restartKernelAndClearOutputs?: (payload: {
    kernelRef?: string | null;
    contentRef: string;
  }) => void;
  restartKernelAndRunAllOutputs?: (payload: {
    kernelRef?: string | null;
    contentRef: string;
  }) => void;
  killKernel?: (payload: actions.KillKernelAction["payload"]) => void;
  interruptKernel?: (payload: actions.InterruptKernel["payload"]) => void;
  currentContentRef: ContentRef;
  currentKernelspecsRef?: KernelspecsRef | null;
  currentKernelspecs?: KernelspecsByRefRecord | null;
  /**
   * Function required to publish notebooks to `Bookstore`.
   * https://github.com/nteract/bookstore#bookstore-books
   */
  onPublish?: (payload: { contentRef: ContentRef }) => void;
}

// To allow actions that can take dynamic arguments (like selecting a kernel
// based on the host's kernelspecs), we have some simple utility functions to
// stringify/parse actions/arguments.
const createActionKey = (action: string, ...args: any[]) =>
  [action, ...args].join(":");
const parseActionKey = (key: string) => key.split(":");

const Dropdown = (props: IMenuItemProps) => (
  <MenuItem
    {...props}
    popoverProps={{
      interactionKind: PopoverInteractionKind.CLICK,
      position: Position.BOTTOM
    }}
  />
);

class PureNotebookMenu extends React.PureComponent<PureNotebookMenuProps> {
  handleActionClick = (e: SyntheticEvent, action: string, ...args: any[]) => {
    // This handler avoid to reimplement the old `handleClick` method
    e.preventDefault();
    const currentKey = { key: createActionKey(action, ...args) };
    // console.log(`::handleActionClick -> ${currentKey.key}`);
    this.handleClick(currentKey);
  };

  handleClick = ({ key }: { key: string }) => {
    const {
      saveNotebook,
      downloadNotebook,
      changeKernelByName,
      copyCell,
      createCellBelow,
      cutCell,
      executeAllCells,
      executeAllCellsBelow,
      clearAllOutputs,
      unhideAll,
      onPublish,
      openAboutModal,
      pasteCell,
      setTheme,
      changeCellType,
      restartKernel,
      restartKernelAndClearOutputs,
      restartKernelAndRunAllOutputs,
      killKernel,
      interruptKernel,
      currentKernelRef,
      currentContentRef,
      toggleNotebookHeaderEditor
    } = this.props;
    const [action, ...args] = parseActionKey(key);
    switch (action) {
      case TOGGLE_EDITOR:
        toggleNotebookHeaderEditor &&
          toggleNotebookHeaderEditor({ contentRef: currentContentRef });
        break;
      case SAVE_NOTEBOOK:
        saveNotebook && saveNotebook({ contentRef: currentContentRef });
        break;
      case DOWNLOAD_NOTEBOOK:
        downloadNotebook && downloadNotebook({ contentRef: currentContentRef });
        break;
      case COPY_CELL:
        copyCell && copyCell({ contentRef: currentContentRef });
        break;
      case CUT_CELL:
        cutCell && cutCell({ contentRef: currentContentRef });
        break;
      case PASTE_CELL:
        pasteCell && pasteCell({ contentRef: currentContentRef });
        break;
      case CREATE_CODE_CELL:
        createCellBelow &&
          createCellBelow({
            cellType: "code",
            source: "",
            contentRef: currentContentRef
          });
        break;
      case CREATE_MARKDOWN_CELL:
        createCellBelow &&
          createCellBelow({
            cellType: "markdown",
            source: "",
            contentRef: currentContentRef
          });
        break;
      case SET_CELL_TYPE_CODE:
        changeCellType &&
          changeCellType({
            to: "code",
            contentRef: currentContentRef
          });

        break;
      case SET_CELL_TYPE_MARKDOWN:
        changeCellType &&
          changeCellType({
            to: "markdown",
            contentRef: currentContentRef
          });
        break;
      case EXECUTE_ALL_CELLS:
        executeAllCells && executeAllCells({ contentRef: currentContentRef });
        break;
      case EXECUTE_ALL_CELLS_BELOW:
        executeAllCellsBelow &&
          executeAllCellsBelow({ contentRef: currentContentRef });
        break;
      case UNHIDE_ALL:
        unhideAll &&
          unhideAll({
            outputHidden: false,
            inputHidden: false,
            contentRef: currentContentRef
          });
        break;
      case CLEAR_ALL_OUTPUTS:
        clearAllOutputs && clearAllOutputs({ contentRef: currentContentRef });
        break;
      case SET_THEME_DARK:
        setTheme && setTheme("dark");
        break;
      case SET_THEME_LIGHT:
        setTheme && setTheme("light");
        break;
      case OPEN_ABOUT:
        openAboutModal && openAboutModal();
        break;
      case INTERRUPT_KERNEL:
        interruptKernel && interruptKernel({ contentRef: currentContentRef });
        break;
      case RESTART_KERNEL:
        restartKernel &&
          restartKernel({
            outputHandling: "None",
            contentRef: currentContentRef
          });
        break;
      case RESTART_AND_CLEAR_OUTPUTS:
        restartKernelAndClearOutputs &&
          restartKernelAndClearOutputs({
            contentRef: currentContentRef
          });
        break;
      case RESTART_AND_RUN_ALL_OUTPUTS:
        restartKernelAndRunAllOutputs &&
          restartKernelAndRunAllOutputs({
            contentRef: currentContentRef
          });
        break;
      case KILL_KERNEL:
        killKernel &&
          killKernel({ restarting: false, kernelRef: currentKernelRef, contentRef: currentContentRef });
        break;
      case CHANGE_KERNEL:
        changeKernelByName &&
          changeKernelByName({
            oldKernelRef: currentKernelRef,
            contentRef: currentContentRef,
            kernelSpecName: args[0]
          });
        break;
      case PUBLISH_TO_BOOKSTORE:
        onPublish && onPublish({ contentRef: currentContentRef });
        break;
      default:
        console.log(`unhandled action: ${action}`);
    }
  };

  render(): JSX.Element {
    const { bookstoreEnabled, currentKernelspecs } = this.props;
    const {
      DOCUMENT_OPEN,
      FLOPPY_DISK,
      DOWNLOAD,
      CLOUD_UPLOAD,
      CUT,
      DUPLICATE,
      CLIPBOARD,
      SWAP_HORIZONTAL,
      WIDGET_HEADER,
      STYLE,
      PLAY,
      INSERT,
      ERASER,
      EYE_OFF,
      PAUSE,
      STOP,
      REPEAT,
      REFRESH,
      REDO,
      EXCHANGE,
      HELP
    } = IconNames;
    const notebookMenuStyles: CSSProperties = {
      position: "sticky",
      top: 0,
      zIndex: 19, // blueprint's Toasts are at 20 and need to go on top
      display: "inline-flex",
      width: "100%",
      background: "var(--theme-app-bg)"
    };

    return (
      <Menu style={notebookMenuStyles}>
        <Dropdown
          text="File"
          children={
            <Menu>
              <MenuItem
                key="open_notebook"
                text="Open..."
                icon={DOCUMENT_OPEN}
                href="/nteract/edit"
                target="_blank"
              />
              <MenuItem
                key="save_notebook"
                onClick={(e: SyntheticEvent) =>
                  this.handleActionClick(e, SAVE_NOTEBOOK)
                }
                text={MENU_ITEM_LABELS.SAVE_NOTEBOOK}
                icon={FLOPPY_DISK}
              />
              <MenuItem
                key="download_notebook"
                onClick={(e: SyntheticEvent) =>
                  this.handleActionClick(e, DOWNLOAD_NOTEBOOK)
                }
                text={MENU_ITEM_LABELS.DOWNLOAD_NOTEBOOK}
                icon={DOWNLOAD}
              />
            </Menu>
          }
        />
        <Dropdown
          text="Edit"
          children={
            <Menu>
              <MenuItem
                key="cut_cell"
                onClick={(e: SyntheticEvent) =>
                  this.handleActionClick(e, CUT_CELL)
                }
                text={MENU_ITEM_LABELS.CUT_CELL}
                icon={CUT}
              />
              <MenuItem
                key="copy_cell"
                onClick={(e: SyntheticEvent) =>
                  this.handleActionClick(e, COPY_CELL)
                }
                text={MENU_ITEM_LABELS.COPY_CELL}
                icon={DUPLICATE}
              />
              <MenuItem
                key="past_cell"
                onClick={(e: SyntheticEvent) =>
                  this.handleActionClick(e, PASTE_CELL)
                }
                text={MENU_ITEM_LABELS.PASTE_CELL}
                icon={CLIPBOARD}
              />
              <MenuDivider />
              <MenuItem text="Change Cell Type" icon={SWAP_HORIZONTAL}>
                <MenuItem
                  key="set_cell_type_code"
                  onClick={(e: SyntheticEvent) =>
                    this.handleActionClick(e, SET_CELL_TYPE_CODE)
                  }
                  text={MENU_ITEM_LABELS.SET_CELL_TYPE_CODE}
                />
                <MenuItem
                  key="set_cell_type_markdown"
                  onClick={(e: SyntheticEvent) =>
                    this.handleActionClick(e, SET_CELL_TYPE_MARKDOWN)
                  }
                  text={MENU_ITEM_LABELS.SET_CELL_TYPE_MARKDOWN}
                />
              </MenuItem>
            </Menu>
          }
        />
        <Dropdown
          text="Cell"
          children={
            <Menu>
              <MenuItem
                key="execute_all_cells"
                onClick={(e: SyntheticEvent) =>
                  this.handleActionClick(e, EXECUTE_ALL_CELLS)
                }
                text={MENU_ITEM_LABELS.EXECUTE_ALL_CELLS}
                icon={PLAY}
              />
              <MenuItem
                key="execute_all_cells_below"
                onClick={(e: SyntheticEvent) =>
                  this.handleActionClick(e, EXECUTE_ALL_CELLS_BELOW)
                }
                text={MENU_ITEM_LABELS.EXECUTE_ALL_CELLS_BELOW}
                icon={PLAY}
              />
              <MenuDivider />
              <MenuItem text="Create New" icon={INSERT}>
                <MenuItem
                  key="create_code_cell"
                  onClick={(e: SyntheticEvent) =>
                    this.handleActionClick(e, CREATE_CODE_CELL)
                  }
                  text={MENU_ITEM_LABELS.CREATE_CODE_CELL}
                />
                <MenuItem
                  key="create_markdown_cell"
                  onClick={(e: SyntheticEvent) =>
                    this.handleActionClick(e, CREATE_MARKDOWN_CELL)
                  }
                  text={MENU_ITEM_LABELS.CREATE_MARKDOWN_CELL}
                />
              </MenuItem>
              <MenuDivider />
              <MenuItem
                key="clear_all_outputs"
                onClick={(e: SyntheticEvent) =>
                  this.handleActionClick(e, CLEAR_ALL_OUTPUTS)
                }
                text={MENU_ITEM_LABELS.CLEAR_ALL_OUTPUTS}
                icon={ERASER}
              />
              <MenuItem
                key="unhide_all"
                onClick={(e: SyntheticEvent) =>
                  this.handleActionClick(e, UNHIDE_ALL)
                }
                text={MENU_ITEM_LABELS.UNHIDE_ALL}
                icon={EYE_OFF}
              />
            </Menu>
          }
        />
        <Dropdown
          text="Runtime"
          children={
            <Menu>
              <MenuItem
                key="interrupt_kernel"
                onClick={(e: SyntheticEvent) =>
                  this.handleActionClick(e, INTERRUPT_KERNEL)
                }
                text={MENU_ITEM_LABELS.INTERRUPT_KERNEL}
                icon={PAUSE}
              />
              <MenuDivider />
              <MenuItem
                key="kill_kernel"
                onClick={(e: SyntheticEvent) =>
                  this.handleActionClick(e, KILL_KERNEL)
                }
                text={MENU_ITEM_LABELS.KILL_KERNEL}
                icon={STOP}
              />
              <MenuItem
                key="restart_kernel"
                onClick={(e: SyntheticEvent) =>
                  this.handleActionClick(e, RESTART_KERNEL)
                }
                text={MENU_ITEM_LABELS.RESTART_KERNEL}
                icon={REPEAT}
              />
              <MenuItem
                key="restart_kernel_and_clear"
                onClick={(e: SyntheticEvent) =>
                  this.handleActionClick(e, RESTART_AND_CLEAR_OUTPUTS)
                }
                text={MENU_ITEM_LABELS.RESTART_AND_CLEAR_OUTPUTS}
                icon={REFRESH}
              />
              <MenuItem
                key="restart_kernel_and_run_all"
                onClick={(e: SyntheticEvent) =>
                  this.handleActionClick(e, RESTART_AND_RUN_ALL_OUTPUTS)
                }
                text={MENU_ITEM_LABELS.RESTART_AND_RUN_ALL_OUTPUTS}
                icon={REDO}
              />
              <MenuDivider />
              <MenuItem
                key="change_kernel"
                disabled={!currentKernelspecs}
                text="Change Kernel"
                icon={EXCHANGE}
              >
                {currentKernelspecs &&
                  currentKernelspecs.byName
                    .keySeq()
                    .map((name: string) => [
                      name,
                      currentKernelspecs.byName.getIn([name, "displayName"])
                    ])
                    .toArray()
                    .map(([name, displayName]: string[]) => {
                      return (
                        <MenuItem
                          key={displayName}
                          onClick={(e: SyntheticEvent) =>
                            this.handleActionClick(e, CHANGE_KERNEL, name)
                          }
                          text={displayName}
                        />
                      );
                    })}
              </MenuItem>
            </Menu>
          }
        />
      </Menu>
    );
  }
}

export default PureNotebookMenu;
