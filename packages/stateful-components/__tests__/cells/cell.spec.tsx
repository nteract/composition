import { mount } from "enzyme";
import Immutable from "immutable";
import React from "react";

import { Cell } from "../../src/cells/cell";

describe("Cell", () => {
  it("picks the correct child component when it exists", () => {
    function ChosenOneCell(props) {
      return <p>ChosenOneCell</p>;
    }
    ChosenOneCell.defaultProps = { cell_type: "the_one" };
    function NotTheOneCell(props) {
      return <p>NotTheOneCell</p>;
    }
    NotTheOneCell.defaultProps = { cell_type: "not_the_one" };
    const component = mount(
      <Cell
        id="cellId"
        contentRef="contentRef"
        cell={Immutable.Map({ cell_type: "the_one" })}
      >
        <ChosenOneCell />
        <NotTheOneCell />
      </Cell>
    );
    expect(component.html()).toBe("<p>ChosenOneCell</p>");
  });
  it("returns null when no valid child component exists", () => {
    function ChosenOneCell(props) {
      return <p>ChosenOneCell</p>;
    }
    ChosenOneCell.defaultProps = { cell_type: "the_one" };
    function NotTheOneCell(props) {
      return <p>NotTheOneCell</p>;
    }
    NotTheOneCell.defaultProps = { cell_type: "not_the_one" };
    const component = mount(
      <Cell
        id="cellId"
        contentRef="contentRef"
        cell={Immutable.Map({ cell_type: "neither_one" })}
      >
        <ChosenOneCell />
        <NotTheOneCell />
      </Cell>
    );
    expect(component.children()).toHaveLength(0);
  });
  it("only looks for the cell_type prop when matching", () => {
    function ChosenOneCell(props) {
      return <p>ChosenOneCell</p>;
    }
    ChosenOneCell.defaultProps = { not_cell_type: "the_one" };
    function NotTheOneCell(props) {
      return <p>NotTheOneCell</p>;
    }
    NotTheOneCell.defaultProps = { cell_type: "not_the_one" };
    const component = mount(
      <Cell
        id="cellId"
        contentRef="contentRef"
        cell={Immutable.Map({ cell_type: "the_one" })}
      >
        <ChosenOneCell />
        <NotTheOneCell />
      </Cell>
    );
    expect(component.children()).toHaveLength(0);
  });
});
