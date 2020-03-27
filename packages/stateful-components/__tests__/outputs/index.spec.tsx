import { mount } from "enzyme";
import Immutable from "immutable";
import React from "react";

import { selectors } from "@nteract/core";
import { mockAppState } from "@nteract/fixtures";

import { makeMapStateToProps, Outputs } from "../../src/outputs";

describe("Outputs", () => {
  it("sets hidden class correctly based on props", () => {
    const component = mount(
      <Outputs
        id={"cellId"}
        contentRef={"contentRef"}
        hidden
        expanded={false}
        outputs={Immutable.List()}
      >
        <p>test</p>
      </Outputs>
    );
    expect(component.find(".hidden").length).not.toBe(0);
  });
  it("sets expanded class when expanded prop is true", () => {
    const component = mount(
      <Outputs
        id={"cellId"}
        contentRef={"contentRef"}
        hidden={false}
        expanded
        outputs={Immutable.List()}
      >
        <p>test</p>
      </Outputs>
    );
    expect(component.find(".expanded").length).not.toBe(0);
  });
  it("does not set expanded class when expanded prop is false", () => {
    const component = mount(
      <Outputs
        id={"cellId"}
        contentRef={"contentRef"}
        hidden={false}
        expanded={false}
        outputs={Immutable.List()}
      >
        <p>test</p>
      </Outputs>
    );
    expect(component.find(".expanded").length).toBe(0);
  });
});

describe("makeMapStateToProps", () => {
  it("returns default values if not given valid notebook", () => {
    const state = mockAppState({});
    const ownProps = { contentRef: "aContentRef", id: "aCellId" };
    const result = makeMapStateToProps(state, ownProps)(state);
    expect(result.expanded).toBe(false);
    expect(result.hidden).toBe(false);
    expect(result.outputs.size).toBe(0);
  });
  it("returns expected values for valid code cell", () => {
    const state = mockAppState({ codeCellCount: 2 });
    const contentRef: string = state.core.entities.contents.byRef
      .keySeq()
      .first();
    const id = selectors.notebook
      .cellOrder(selectors.model(state, { contentRef }))
      .first();
    const ownProps = { contentRef, id };
    const result = makeMapStateToProps(state, ownProps)(state);
    expect(result.hidden).toBe(false);
    expect(result.expanded).toBe(true);
  });
});
