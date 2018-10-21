// @flow
import * as React from "react";
import { mount } from "enzyme";
import toJSON from "enzyme-to-json";
import { Provider } from "react-redux";
import { dummyStore } from "@nteract/core/dummy";
import { actionTypes } from "@nteract/core";

import Toolbar, { PureToolbar } from "../src/toolbar";

const {
  DELETE_CELL,
  SEND_EXECUTE_REQUEST,
  CLEAR_OUTPUTS,
  TOGGLE_CELL_INPUT_VISIBILITY,
  TOGGLE_CELL_OUTPUT_VISIBILITY,
  CHANGE_CELL_TYPE,
  TOGGLE_OUTPUT_EXPANSION
} = actionTypes;

describe("Toolbar View", () => {
  test("should be able to render a toolbar", () => {
    const toolbar = mount(<PureToolbar />);
    expect(toJSON(toolbar)).toMatchSnapshot();
    toolbar.find(".toggle-menu").simulate("click");
    expect(toJSON(toolbar)).toMatchSnapshot();
  });
  test("clearOutputs can be clicked", () => {
    const dummyFunc = jest.fn();
    const toolbar = mount(<PureToolbar type="code" clearOutputs={dummyFunc} />);
    toolbar.find(".toggle-menu").simulate("click");
    toolbar.find(".clearOutput").simulate("click");
    expect(dummyFunc).toHaveBeenCalled();
  });
  test("toggleCellInputVisibility can be clicked", () => {
    const dummyFunc = jest.fn();
    const toolbar = mount(
      <PureToolbar type="code" toggleCellInputVisibility={dummyFunc} />
    );
    toolbar.find(".toggle-menu").simulate("click");
    toolbar.find(".inputVisibility").simulate("click");
    expect(dummyFunc).toHaveBeenCalled();
  });
  test("toggleCellOutputVisibility can be clicked", () => {
    const dummyFunc = jest.fn();
    const toolbar = mount(
      <PureToolbar type="code" toggleCellOutputVisibility={dummyFunc} />
    );
    toolbar.find(".toggle-menu").simulate("click");
    toolbar.find(".outputVisibility").simulate("click");
    expect(dummyFunc).toHaveBeenCalled();
  });
  test("toggleOutputExpaned can be clicked", () => {
    const dummyFunc = jest.fn();
    const toolbar = mount(
      <PureToolbar type="code" toggleOutputExpansion={dummyFunc} />
    );
    toolbar.find(".toggle-menu").simulate("click");
    toolbar.find(".outputExpanded").simulate("click");
    expect(dummyFunc).toHaveBeenCalled();
  });
  test("changeCellType can be clicked", () => {
    const dummyFunc = jest.fn();
    const toolbar = mount(
      <PureToolbar type="code" changeCellType={dummyFunc} />
    );
    toolbar.find(".toggle-menu").simulate("click");
    toolbar.find(".changeType").simulate("click");
    expect(dummyFunc).toHaveBeenCalled();
  });
  test('shows "convert to code cell" menu entry for markdown type', () => {
    const toolbar = mount(<PureToolbar type={"markdown"} />);
    toolbar.find(".toggle-menu").simulate("click");
    expect(toolbar.text()).toContain("Convert to Code Cell");
  });
  test('shows "convert to markdown cell" menu entry for code type', () => {
    const toolbar = mount(<PureToolbar type="code" />);
    toolbar.find(".toggle-menu").simulate("click");
    expect(toolbar.text()).toContain("Convert to Markdown Cell");
  });
});

describe.skip("toolbar provider", () => {
  const store = dummyStore();
  const dropdown = { hide: () => {} };

  const setup = props =>
    mount(
      <Provider store={store}>
        <Toolbar {...props} />
      </Provider>
    );

  test("Delete Cell works", done => {
    const dispatch = action => {
      expect(action.id).toBe("cell");
      expect(action.type).toBe(DELETE_CELL);
      done();
    };
    store.dispatch = dispatch;
    const toolbar = setup({ type: "code", id: "cell" });
    toolbar
      .find("ToolbarView")
      .childAt(0)
      .getElement()
      .deleteCell();
  });

  test("execute cell works", done => {
    const dispatch = action => {
      expect(action.id).toBe("cell");
      expect(action.source).toBe("source");
      expect(action.type).toBe(SEND_EXECUTE_REQUEST);
      done();
    };
    store.dispatch = dispatch;
    const func = args => args;
    const cell = { get: func };
    const toolbar = setup({ id: "cell", cell });
    toolbar
      .find("ToolbarView")
      .childAt(0)
      .getElement()
      .executeCell();
  });

  test("clear outputs works", done => {
    const dispatch = action => {
      expect(action.id).toBe("cell");
      expect(action.type).toBe(CLEAR_OUTPUTS);
      done();
    };
    store.dispatch = dispatch;
    const toolbar = setup({ id: "cell" });
    toolbar
      .find("ToolbarView")
      .childAt(0)
      .getElement()
      .clearOutputs(dropdown);
  });

  test("change Input Visibility works", done => {
    const dispatch = action => {
      expect(action.id).toBe("cell");
      expect(action.type).toBe(TOGGLE_CELL_INPUT_VISIBILITY);
      done();
    };
    store.dispatch = dispatch;
    const toolbar = setup({ id: "cell" });
    toolbar
      .find("ToolbarView")
      .childAt(0)
      .getElement()
      .toggleCellInputVisibility(dropdown);
  });

  test("change Output Visibility works", done => {
    const dispatch = action => {
      expect(action.id).toBe("cell");
      expect(action.type).toBe(TOGGLE_CELL_OUTPUT_VISIBILITY);
      done();
    };
    store.dispatch = dispatch;
    const toolbar = setup({ id: "cell" });
    toolbar
      .find("ToolbarView")
      .childAt(0)
      .getElement()
      .toggleCellOutputVisibility(dropdown);
  });

  test("change Cell Type works", done => {
    const dispatch = action => {
      expect(action.id).toBe("cell");
      expect(action.to).toBe("markdown");
      expect(action.type).toBe(CHANGE_CELL_TYPE);
      done();
    };
    store.dispatch = dispatch;
    const toolbar = setup({ id: "cell", type: "code" });
    toolbar
      .find("ToolbarView")
      .childAt(0)
      .getElement()
      .changeCellType(dropdown);
  });

  test("toggle output expansion works", done => {
    const dispatch = action => {
      expect(action.id).toBe("cell");
      expect(action.type).toBe(TOGGLE_OUTPUT_EXPANSION);
      done();
    };
    store.dispatch = dispatch;
    const toolbar = setup({ id: "cell" });
    toolbar
      .find("ToolbarView")
      .childAt(0)
      .getElement()
      .toggleOutputExpansion(dropdown);
  });
});

describe.skip("toolbar provider", () => {
  const store = dummyStore();
  const dropdown = { hide: () => {} };

  const setup = props =>
    mount(
      <Provider store={store}>
        <Toolbar {...props} />
      </Provider>
    );

  test("Delete Cell works", done => {
    const dispatch = action => {
      expect(action.id).toBe("cell");
      expect(action.type).toBe(DELETE_CELL);
      done();
    };
    store.dispatch = dispatch;
    const toolbar = setup({ type: "code", id: "cell" });
    toolbar
      .find("ToolbarView")
      .childAt(0)
      .getElement()
      .deleteCell();
  });

  test("execute cell works", done => {
    const dispatch = action => {
      expect(action.id).toBe("cell");
      expect(action.source).toBe("source");
      expect(action.type).toBe(SEND_EXECUTE_REQUEST);
      done();
    };
    store.dispatch = dispatch;
    const func = args => args;
    const cell = { get: func };
    const toolbar = setup({ id: "cell", cell });
    toolbar
      .find("ToolbarView")
      .childAt(0)
      .getElement()
      .executeCell();
  });

  test("clear outputs works", done => {
    const dispatch = action => {
      expect(action.id).toBe("cell");
      expect(action.type).toBe(CLEAR_OUTPUTS);
      done();
    };
    store.dispatch = dispatch;
    const toolbar = setup({ id: "cell" });
    toolbar
      .find("ToolbarView")
      .childAt(0)
      .getElement()
      .clearOutputs(dropdown);
  });

  test("change Input Visibility works", done => {
    const dispatch = action => {
      expect(action.id).toBe("cell");
      expect(action.type).toBe(TOGGLE_CELL_INPUT_VISIBILITY);
      done();
    };
    store.dispatch = dispatch;
    const toolbar = setup({ id: "cell" });
    toolbar
      .find("ToolbarView")
      .childAt(0)
      .getElement()
      .toggleCellInputVisibility(dropdown);
  });

  test("change Output Visibility works", done => {
    const dispatch = action => {
      expect(action.id).toBe("cell");
      expect(action.type).toBe(TOGGLE_CELL_OUTPUT_VISIBILITY);
      done();
    };
    store.dispatch = dispatch;
    const toolbar = setup({ id: "cell" });
    toolbar
      .find("ToolbarView")
      .childAt(0)
      .getElement()
      .toggleCellOutputVisibility(dropdown);
  });

  test("change Cell Type works", done => {
    const dispatch = action => {
      expect(action.id).toBe("cell");
      expect(action.to).toBe("markdown");
      expect(action.type).toBe(CHANGE_CELL_TYPE);
      done();
    };
    store.dispatch = dispatch;
    const toolbar = setup({ id: "cell", type: "code" });
    toolbar
      .find("ToolbarView")
      .childAt(0)
      .getElement()
      .changeCellType(dropdown);
  });

  test("toggle output expansion works", done => {
    const dispatch = action => {
      expect(action.id).toBe("cell");
      expect(action.type).toBe(TOGGLE_OUTPUT_EXPANSION);
      done();
    };
    store.dispatch = dispatch;
    const toolbar = setup({ id: "cell" });
    toolbar
      .find("ToolbarView")
      .childAt(0)
      .getElement()
      .toggleOutputExpansion(dropdown);
  });
});
