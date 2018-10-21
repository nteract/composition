// @flow
import React from "react";
import renderer from "react-test-renderer";
import { shallow, mount } from "enzyme";

import { PureNotebookMenu } from "../src/notebook-menu";
import { MENU_ITEM_ACTIONS, MENUS } from "../src/notebook-menu/constants";

describe("PureNotebookMenu ", () => {
  describe("snapshots", () => {
    test("renders the default", () => {
      const component = renderer.create(<PureNotebookMenu />);
      let tree = component.toJSON();
      expect(tree).toMatchSnapshot();
    });
  });
  describe("shallow", () => {
    test("renders the default", () => {
      const wrapper = shallow(<PureNotebookMenu />);
      expect(wrapper).not.toBeNull();
    });
  });
  describe("mount", () => {
    test("renders the default", () => {
      const wrapper = mount(<PureNotebookMenu />);
      expect(wrapper).not.toBeNull();
    });
    test("calls appropriate handlers on click", () => {
      const props = {
        // keep menu open after clicks
        persistAfterClick: true,

        // action functions
        executeCell: jest.fn(),
        executeAllCells: jest.fn(),
        executeAllCellsBelow: jest.fn(),
        unhideAll: jest.fn(),
        clearAllOutputs: jest.fn(),
        cutCell: jest.fn(),
        copyCell: jest.fn(),
        pasteCell: jest.fn(),
        createCellBelow: jest.fn(),
        changeCellType: jest.fn(),
        setTheme: jest.fn(),
        saveNotebook: jest.fn(),
        openAboutModal: jest.fn(),
        interruptKernel: jest.fn(),
        restartKernel: jest.fn(),
        restartKernelAndClearOutputs: jest.fn(),
        restartKernelAndRunAllOutputs: jest.fn(),
        killKernel: jest.fn(),
        downloadNotebook: jest.fn(),

        // document state (we mock out the implementation, so these are just
        // dummy variables.
        currentContentRef: "fake-content-ref",
        currentKernelRef: "fake-kernel-ref",

        // menu props, note that we force all menus to be open to click.
        defaultOpenKeys: Object.values(MENUS)
      };
      const wrapper = mount(<PureNotebookMenu {...props} />);

      const downloadNotebookItem = wrapper
        .find({ eventKey: MENU_ITEM_ACTIONS.DOWNLOAD_NOTEBOOK })
        .first();
      expect(props.downloadNotebook).not.toHaveBeenCalled();
      downloadNotebookItem.simulate("click");
      expect(props.downloadNotebook).toHaveBeenCalledTimes(1);
      expect(props.downloadNotebook).toHaveBeenCalledWith({
        contentRef: props.currentContentRef
      });

      const executeAllCellsItem = wrapper
        .find({ eventKey: MENU_ITEM_ACTIONS.EXECUTE_ALL_CELLS })
        .first();
      expect(props.executeAllCells).not.toHaveBeenCalled();
      executeAllCellsItem.simulate("click");
      expect(props.executeAllCells).toHaveBeenCalledTimes(1);
      expect(props.executeAllCells).toHaveBeenCalledWith({
        contentRef: props.currentContentRef
      });

      const executeAllCellsBelowItem = wrapper
        .find({ eventKey: MENU_ITEM_ACTIONS.EXECUTE_ALL_CELLS_BELOW })
        .first();
      expect(props.executeAllCellsBelow).not.toHaveBeenCalled();
      executeAllCellsBelowItem.simulate("click");
      expect(props.executeAllCellsBelow).toHaveBeenCalledTimes(1);
      expect(props.executeAllCellsBelow).toHaveBeenCalledWith({
        contentRef: props.currentContentRef
      });

      const unhideAllItem = wrapper
        .find({ eventKey: MENU_ITEM_ACTIONS.UNHIDE_ALL })
        .first();
      expect(props.unhideAll).not.toHaveBeenCalled();
      unhideAllItem.simulate("click");
      expect(props.unhideAll).toHaveBeenCalledTimes(1);
      expect(props.unhideAll).toHaveBeenCalledWith({
        outputHidden: false,
        inputHidden: false,
        contentRef: props.currentContentRef
      });

      const clearAllOutputsItem = wrapper
        .find({ eventKey: MENU_ITEM_ACTIONS.CLEAR_ALL_OUTPUTS })
        .first();
      expect(props.clearAllOutputs).not.toHaveBeenCalled();
      clearAllOutputsItem.simulate("click");
      expect(props.clearAllOutputs).toHaveBeenCalledTimes(1);
      expect(props.clearAllOutputs).toHaveBeenCalledWith({
        contentRef: props.currentContentRef
      });

      const cutCellItem = wrapper
        .find({ eventKey: MENU_ITEM_ACTIONS.CUT_CELL })
        .first();
      expect(props.cutCell).not.toHaveBeenCalled();
      cutCellItem.simulate("click");
      expect(props.cutCell).toHaveBeenCalledTimes(1);
      expect(props.cutCell).toHaveBeenCalledWith({
        contentRef: props.currentContentRef
      });

      const copyCellItem = wrapper
        .find({ eventKey: MENU_ITEM_ACTIONS.COPY_CELL })
        .first();
      expect(props.copyCell).not.toHaveBeenCalled();
      copyCellItem.simulate("click");
      expect(props.copyCell).toHaveBeenCalledTimes(1);
      expect(props.copyCell).toHaveBeenCalledWith({
        contentRef: props.currentContentRef
      });

      const pasteCellItem = wrapper
        .find({ eventKey: MENU_ITEM_ACTIONS.PASTE_CELL })
        .first();
      expect(props.pasteCell).not.toHaveBeenCalled();
      pasteCellItem.simulate("click");
      expect(props.pasteCell).toHaveBeenCalledTimes(1);
      expect(props.pasteCell).toHaveBeenCalledWith({
        contentRef: props.currentContentRef
      });

      const createMarkdownCellItem = wrapper
        .find({ eventKey: MENU_ITEM_ACTIONS.CREATE_MARKDOWN_CELL })
        .first();
      expect(props.createCellBelow).not.toHaveBeenCalled();
      createMarkdownCellItem.simulate("click");
      expect(props.createCellBelow).toHaveBeenCalledTimes(1);
      expect(props.createCellBelow).toHaveBeenCalledWith({
        cellType: "markdown",
        contentRef: props.currentContentRef,
        source: ""
      });

      props.createCellBelow.mockClear();
      const createCodeCellItem = wrapper
        .find({ eventKey: MENU_ITEM_ACTIONS.CREATE_CODE_CELL })
        .first();
      expect(props.createCellBelow).not.toHaveBeenCalled();
      createCodeCellItem.simulate("click");
      expect(props.createCellBelow).toHaveBeenCalledTimes(1);
      expect(props.createCellBelow).toHaveBeenCalledWith({
        cellType: "code",
        contentRef: props.currentContentRef,
        source: ""
      });

      const setCellTypeCodeItem = wrapper
        .find({ eventKey: MENU_ITEM_ACTIONS.SET_CELL_TYPE_CODE })
        .first();
      expect(props.changeCellType).not.toHaveBeenCalled();
      setCellTypeCodeItem.simulate("click");
      expect(props.changeCellType).toHaveBeenCalledTimes(1);
      expect(props.changeCellType).toHaveBeenCalledWith({
        to: "code",
        contentRef: props.currentContentRef
      });

      props.changeCellType.mockClear();
      const setCellTypeMarkdownItem = wrapper
        .find({ eventKey: MENU_ITEM_ACTIONS.SET_CELL_TYPE_MARKDOWN })
        .first();
      expect(props.changeCellType).not.toHaveBeenCalled();
      setCellTypeMarkdownItem.simulate("click");
      expect(props.changeCellType).toHaveBeenCalledTimes(1);
      expect(props.changeCellType).toHaveBeenCalledWith({
        to: "markdown",
        contentRef: props.currentContentRef
      });

      const setThemeLightItem = wrapper
        .find({ eventKey: MENU_ITEM_ACTIONS.SET_THEME_LIGHT })
        .first();
      expect(props.setTheme).not.toHaveBeenCalled();
      setThemeLightItem.simulate("click");
      expect(props.setTheme).toHaveBeenCalledTimes(1);
      expect(props.setTheme).toHaveBeenCalledWith("light");

      props.setTheme.mockClear();
      const setThemeDarkItem = wrapper
        .find({ eventKey: MENU_ITEM_ACTIONS.SET_THEME_DARK })
        .first();
      expect(props.setTheme).not.toHaveBeenCalled();
      setThemeDarkItem.simulate("click");
      expect(props.setTheme).toHaveBeenCalledTimes(1);
      expect(props.setTheme).toHaveBeenCalledWith("dark");

      const saveNotebookItem = wrapper
        .find({ eventKey: MENU_ITEM_ACTIONS.SAVE_NOTEBOOK })
        .first();
      expect(props.saveNotebook).not.toHaveBeenCalled();
      saveNotebookItem.simulate("click");
      expect(props.saveNotebook).toHaveBeenCalledTimes(1);
      expect(props.saveNotebook).toHaveBeenCalledWith({
        contentRef: props.currentContentRef
      });

      const openAboutItem = wrapper
        .find({ eventKey: MENU_ITEM_ACTIONS.OPEN_ABOUT })
        .first();
      expect(props.openAboutModal).not.toHaveBeenCalled();
      openAboutItem.simulate("click");
      expect(props.openAboutModal).toHaveBeenCalledTimes(1);
      expect(props.openAboutModal).toHaveBeenCalledWith();

      const interruptKernelItem = wrapper
        .find({ eventKey: MENU_ITEM_ACTIONS.INTERRUPT_KERNEL })
        .first();
      expect(props.interruptKernel).not.toHaveBeenCalled();
      interruptKernelItem.simulate("click");
      expect(props.interruptKernel).toHaveBeenCalledTimes(1);
      expect(props.interruptKernel).toHaveBeenCalledWith({
        kernelRef: props.currentKernelRef
      });

      const restartKernelItem = wrapper
        .find({ eventKey: MENU_ITEM_ACTIONS.RESTART_KERNEL })
        .first();
      expect(props.restartKernel).not.toHaveBeenCalled();
      restartKernelItem.simulate("click");
      expect(props.restartKernel).toHaveBeenCalledTimes(1);
      expect(props.restartKernel).toHaveBeenCalledWith({
        contentRef: props.currentContentRef,
        kernelRef: props.currentKernelRef
      });

      const restartKernelAndClearOutputsItem = wrapper
        .find({ eventKey: MENU_ITEM_ACTIONS.RESTART_AND_CLEAR_OUTPUTS })
        .first();
      expect(props.restartKernelAndClearOutputs).not.toHaveBeenCalled();
      restartKernelAndClearOutputsItem.simulate("click");
      expect(props.restartKernelAndClearOutputs).toHaveBeenCalledTimes(1);
      expect(props.restartKernelAndClearOutputs).toHaveBeenCalledWith({
        contentRef: props.currentContentRef,
        kernelRef: props.currentKernelRef
      });

      const restartKernelAndRunAllOutputsItem = wrapper
        .find({ eventKey: MENU_ITEM_ACTIONS.RESTART_AND_RUN_ALL_OUTPUTS })
        .first();
      expect(props.restartKernelAndRunAllOutputs).not.toHaveBeenCalled();
      restartKernelAndRunAllOutputsItem.simulate("click");
      expect(props.restartKernelAndRunAllOutputs).toHaveBeenCalledTimes(1);
      expect(props.restartKernelAndRunAllOutputs).toHaveBeenCalledWith({
        contentRef: props.currentContentRef,
        kernelRef: props.currentKernelRef
      });

      const killKernelItem = wrapper
        .find({ eventKey: MENU_ITEM_ACTIONS.KILL_KERNEL })
        .first();
      expect(props.killKernel).not.toHaveBeenCalled();
      killKernelItem.simulate("click");
      expect(props.killKernel).toHaveBeenCalledTimes(1);
      expect(props.killKernel).toHaveBeenCalledWith({
        kernelRef: props.currentKernelRef
      });
    });
  });
});
