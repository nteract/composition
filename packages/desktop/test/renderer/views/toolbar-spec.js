import React from "react";

import { mount } from "enzyme";
import Toolbar from "../../../src/notebook/views/toolbar";

const chai = require("chai");
const sinon = require("sinon");
const sinonChai = require("sinon-chai");

chai.use(sinonChai);
const expect = chai.expect;

describe("Toolbar View", () => {
  it("should be able to render a toolbar", () => {
    const toolbar = mount(<Toolbar />);
    expect(toolbar).to.not.be.null;
    expect(toolbar.find("div.cell-toolbar").length).to.be.greaterThan(0);
  });
  it("clearOutputs can be clicked", () => {
    const dummyFunc = sinon.spy();
    const toolbar = mount(<Toolbar type={"code"} clearOutputs={dummyFunc} />);
    toolbar.find(".clearOutput").simulate("click");
    expect(dummyFunc).to.have.been.called;
  });
  it("changeInputVisibility can be clicked", () => {
    const dummyFunc = sinon.spy();
    const toolbar = mount(
      <Toolbar type={"code"} changeInputVisibility={dummyFunc} />
    );
    toolbar.find(".inputVisibility").simulate("click");
    expect(dummyFunc).to.have.been.called;
  });
  it("changeOutputVisibility can be clicked", () => {
    const dummyFunc = sinon.spy();
    const toolbar = mount(
      <Toolbar type={"code"} changeOutputVisibility={dummyFunc} />
    );
    toolbar.find(".outputVisibility").simulate("click");
    expect(dummyFunc).to.have.been.called;
  });
  it("toggleOutputExpaned can be clicked", () => {
    const dummyFunc = sinon.spy();
    const toolbar = mount(
      <Toolbar type={"code"} toggleOutputExpansion={dummyFunc} />
    );
    toolbar.find(".outputExpanded").simulate("click");
    expect(dummyFunc).to.have.been.called;
  });
  it("changeCellType can be clicked", () => {
    const dummyFunc = sinon.spy();
    const toolbar = mount(<Toolbar type={"code"} changeCellType={dummyFunc} />);
    toolbar.find(".changeType").simulate("click");
    expect(dummyFunc).to.have.been.called;
  });
  it('shows "convert to code cell" menu entry for markdown type', () => {
    const toolbar = mount(<Toolbar type={"markdown"} />);
    expect(toolbar.text()).to.contain("Convert to Code Cell");
  });
  it('shows "convert to markdown cell" menu entry for code type', () => {
    const toolbar = mount(<Toolbar type={"code"} />);
    expect(toolbar.text()).to.contain("Convert to Markdown Cell");
  });
  it('changes "Convert to ..." menu entry on type change', () => {
    const toolbar = mount(<Toolbar type={"code"} />);
    expect(toolbar.text()).to.contain("Convert to Markdown Cell");
    toolbar.setProps({ type: "markdown" });
    expect(toolbar.text()).to.contain("Convert to Code Cell");
  });
});
