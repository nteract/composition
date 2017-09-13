import React from "react";
import sinon from "sinon";
import { expect } from "chai";
import { shallow } from "enzyme";

import CellCreator from "../../../src/notebook/views/cell-creator";

describe("CellCreatorView", () => {
  const createCell = sinon.spy();
  const mergeCell = sinon.spy();

  const setup = id =>
    shallow(
      <CellCreator
        createCell={createCell}
        mergeCell={mergeCell}
        above={false}
        id={id}
      />
    );

  it("can be constructed", () => {
    const component = setup("test");
    expect(component).to.not.be.null;
  });
  it("creates cell creator buttons if no cells exist", () => {
    const component = setup(null);
    const buttons = component.find(".cell-creator");
    expect(buttons).to.have.length(1);
  });
  it("does not create cell creator buttons if not hovered", () => {
    const component = setup("test");
    const buttons = component.find(".cell-creator");
    expect(buttons).to.not.have.length(1);
  });
  it("has create text cell button", () => {
    const component = setup(null);
    expect(component.find(".add-text-cell").length).to.be.greaterThan(0);
  });
  it("has create code cell button", () => {
    const component = setup(null);
    expect(component.find(".add-code-cell").length).to.be.greaterThan(0);
  });
  it("clicking text cell button invokes createCell", () => {
    const component = setup(null);
    component.find(".add-text-cell").simulate("click");
    expect(createCell).to.have.been.calledWith("markdown");
  });
  it("clicking code cell button invokes createCell", () => {
    const component = setup(null);
    component.find(".add-code-cell").simulate("click");
    expect(createCell).to.have.been.calledWith("code");
  });
  it("clicking merge cell button invokes mergeCell", () => {
    const component = setup(null);
    component.find(".merge-cell").simulate("click");
    expect(mergeCell).to.have.been.called;
  });
});
