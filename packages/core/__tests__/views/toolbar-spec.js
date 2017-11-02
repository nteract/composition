import React from "react";

import { mount } from "enzyme";
import Toolbar from "../../src/views/toolbar";

describe("Toolbar View", () => {
  test("should be able to render a toolbar", () => {
    const toolbar = mount(<Toolbar />);
    expect(toolbar).not.toBeNull();
    expect(toolbar.find("div.cell-toolbar").length).toBeGreaterThan(0);
  });
  test("clearOutputs can be clicked", () => {
    const dummyFunc = jest.fn();
    const toolbar = mount(<Toolbar type={"code"} clearOutputs={dummyFunc} />);
    toolbar.find(".clearOutput").simulate("click");
    expect(dummyFunc).toHaveBeenCalled();
  });
  test("changeInputVisibility can be clicked", () => {
    const dummyFunc = jest.fn();
    const toolbar = mount(
      <Toolbar type={"code"} changeInputVisibility={dummyFunc} />
    );
    toolbar.find(".inputVisibility").simulate("click");
    expect(dummyFunc).toHaveBeenCalled();
  });
  test("changeOutputVisibility can be clicked", () => {
    const dummyFunc = jest.fn();
    const toolbar = mount(
      <Toolbar type={"code"} changeOutputVisibility={dummyFunc} />
    );
    toolbar.find(".outputVisibility").simulate("click");
    expect(dummyFunc).toHaveBeenCalled();
  });
  test("toggleOutputExpaned can be clicked", () => {
    const dummyFunc = jest.fn();
    const toolbar = mount(
      <Toolbar type={"code"} toggleOutputExpansion={dummyFunc} />
    );
    toolbar.find(".outputExpanded").simulate("click");
    expect(dummyFunc).toHaveBeenCalled();
  });
  test("changeCellType can be clicked", () => {
    const dummyFunc = jest.fn();
    const toolbar = mount(<Toolbar type={"code"} changeCellType={dummyFunc} />);
    toolbar.find(".changeType").simulate("click");
    expect(dummyFunc).toHaveBeenCalled();
  });
  test('shows "convert to code cell" menu entry for markdown type', () => {
    const toolbar = mount(<Toolbar type={"markdown"} />);
    expect(toolbar.text()).toContain("Convert to Code Cell");
  });
  test('shows "convert to markdown cell" menu entry for code type', () => {
    const toolbar = mount(<Toolbar type={"code"} />);
    expect(toolbar.text()).toContain("Convert to Markdown Cell");
  });
  test('changes "Convert to ..." menu entry on type change', () => {
    const toolbar = mount(<Toolbar type={"code"} />);
    expect(toolbar.text()).toContain("Convert to Markdown Cell");
    toolbar.setProps({ type: "markdown" });
    expect(toolbar.text()).toContain("Convert to Code Cell");
  });
});
