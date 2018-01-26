// @flow
import React from "react";
import renderer from "react-test-renderer";
import * as Immutable from "immutable";

import { shallow, mount } from "enzyme";

import { PureNotebookMenu } from "../../src/components/notebook-menu";
import { ACTIONS, MENUS } from "../../src/components/notebook-menu/constants";

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
        // action functions
        executeCell: jest.fn(),
        cutCell: jest.fn(),
        copyCell: jest.fn(),
        pasteCell: jest.fn(),
        createCodeCell: jest.fn(),
        createMarkdownCell: jest.fn(),
        setCellTypeCode: jest.fn(),
        setCellTypeMarkdown: jest.fn(),

        // document state
        cellFocused: "b",
        cellMap: Immutable.Map({
          a: Immutable.Map({ cell_type: "code" }),
          b: Immutable.Map({ cell_type: "code" }),
          c: Immutable.Map({ cell_type: "markdown" }),
          d: Immutable.Map({ cell_type: "code" })
        }),
        cellOrder: Immutable.List(["a", "b", "c", "d"]),

        // menu props, note that we force all menus to be open to click.
        defaultOpenKeys: Object.values(MENUS)
      };
      const wrapper = mount(<PureNotebookMenu {...props} />);

      // Test that we call executeAllCells
      const executeAllCellsItem = wrapper
        .find({ eventKey: ACTIONS.EXECUTE_ALL_CELLS })
        .first();
      expect(props.executeCell).not.toHaveBeenCalled();
      executeAllCellsItem.simulate("click");
      expect(props.executeCell).toHaveBeenCalledTimes(3);
      expect(props.executeCell).toHaveBeenCalledWith("a");
      expect(props.executeCell).toHaveBeenCalledWith("b");
      expect(props.executeCell).toHaveBeenCalledWith("d");
      props.executeCell.mockClear();

      const executeAllCellsBelowItem = wrapper
        .find({ eventKey: ACTIONS.EXECUTE_ALL_CELLS_BELOW })
        .first();
      expect(props.executeCell).not.toHaveBeenCalled();
      executeAllCellsBelowItem.simulate("click");
      expect(props.executeCell).toHaveBeenCalledTimes(2);
      expect(props.executeCell).toHaveBeenCalledWith("b");
      expect(props.executeCell).toHaveBeenCalledWith("d");
      props.executeCell.mockClear();

      const cutCellItem = wrapper.find({ eventKey: ACTIONS.CUT_CELL }).first();
      expect(props.cutCell).not.toHaveBeenCalled();
      cutCellItem.simulate("click");
      expect(props.cutCell).toHaveBeenCalled();

      const copyCellItem = wrapper
        .find({ eventKey: ACTIONS.COPY_CELL })
        .first();
      expect(props.copyCell).not.toHaveBeenCalled();
      copyCellItem.simulate("click");
      expect(props.copyCell).toHaveBeenCalled();

      const pasteCellItem = wrapper
        .find({ eventKey: ACTIONS.PASTE_CELL })
        .first();
      expect(props.pasteCell).not.toHaveBeenCalled();
      pasteCellItem.simulate("click");
      expect(props.pasteCell).toHaveBeenCalled();

      const createMarkdownCellItem = wrapper
        .find({ eventKey: ACTIONS.CREATE_MARKDOWN_CELL })
        .first();
      expect(props.createMarkdownCell).not.toHaveBeenCalled();
      createMarkdownCellItem.simulate("click");
      expect(props.createMarkdownCell).toHaveBeenCalled();

      const createCodeCellItem = wrapper
        .find({ eventKey: ACTIONS.CREATE_CODE_CELL })
        .first();
      expect(props.createCodeCell).not.toHaveBeenCalled();
      createCodeCellItem.simulate("click");
      expect(props.createCodeCell).toHaveBeenCalled();

      const setCellTypeCodeItem = wrapper
        .find({ eventKey: ACTIONS.SET_CELL_TYPE_CODE })
        .first();
      expect(props.setCellTypeCode).not.toHaveBeenCalled();
      setCellTypeCodeItem.simulate("click");
      expect(props.setCellTypeCode).toHaveBeenCalled();

      const setCellTypeMarkdownItem = wrapper
        .find({ eventKey: ACTIONS.SET_CELL_TYPE_MARKDOWN })
        .first();
      expect(props.setCellTypeMarkdown).not.toHaveBeenCalled();
      setCellTypeMarkdownItem.simulate("click");
      expect(props.setCellTypeMarkdown).toHaveBeenCalled();
    });
  });
});
