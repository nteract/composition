/* eslint-disable max-len */
import React from "react";
import Immutable from "immutable";
import { Provider } from "react-redux";
import { shallow, mount } from "enzyme";

import { displayOrder, transforms } from "@nteract/transforms-full";
import Cell from "../../../src/notebook/components/cell/cell";
import {
  Notebook,
  getLanguageMode
} from "../../../src/notebook/components/notebook";

import { dummyStore } from "../../utils";
import { dummyCommutable } from "../dummy-nb";

const chai = require("chai");
const sinon = require("sinon");
const sinonChai = require("sinon-chai");

chai.use(sinonChai);
const expect = chai.expect;
const dummyCellStatuses = dummyCommutable
  .get("cellOrder")
  .reduce(
    (statuses, cellID) =>
      statuses.set(
        cellID,
        Immutable.fromJS({ outputHidden: false, inputHidden: false })
      ),
    new Immutable.Map()
  );

// Boilerplate test to make sure the testing setup is configured
describe("Notebook", () => {
  it("accepts an Immutable.List of cells", () => {
    const component = shallow(
      <Notebook
        notebook={dummyCommutable}
        transient={new Immutable.Map({ cellMap: new Immutable.Map() })}
        cellPagers={new Immutable.Map()}
        cellStatuses={new Immutable.Map()}
        stickyCells={new Immutable.Map()
          // Sticky the first cell of the notebook so that the sticky code gets
          // triggered.
          .set(dummyCommutable.getIn(["cellOrder", 0]), true)}
        CellComponent={Cell}
      />
    );
    expect(component).to.not.be.null;
  });
  it("implements the correct css spec", () => {
    const component = mount(
      <Provider store={dummyStore()}>
        <Notebook
          notebook={dummyCommutable}
          transient={new Immutable.Map({ cellMap: new Immutable.Map() })}
          cellPagers={new Immutable.Map()}
          cellStatuses={dummyCellStatuses}
          stickyCells={new Immutable.Map()}
          displayOrder={displayOrder}
          transforms={transforms}
          CellComponent={Cell}
          models={new Immutable.Map({})}
        />
      </Provider>
    );
    expect(component.find(".notebook").length).to.be.above(0, ".notebook");
    expect(component.find(".notebook .cell").length).to.be.above(
      0,
      ".notebook .cell"
    );
    expect(component.find(".notebook .cell.text").length).to.be.above(
      0,
      ".notebook .cell.text"
    );
    expect(component.find(".notebook .cell.code").length).to.be.above(
      0,
      ".notebook .cell.code"
    );
    expect(component.find(".notebook .cell.unknown").length).to.equal(
      0,
      ".notebook .cell.unknown does not exist"
    );
    expect(component.find(".notebook .cell.text .rendered").length).to.be.above(
      0,
      ".notebook .cell.text .rendered"
    );
    expect(
      component.find(".notebook .cell.code .input-container").length
    ).to.be.above(0, ".notebook .cell.code .input-container");
    expect(
      component.find(".notebook .cell.code .input-container .prompt").length
    ).to.be.above(0, ".notebook .cell.code .input-container .prompt");
    expect(
      component.find(".notebook .cell.code .input-container .input").length
    ).to.be.above(0, ".notebook .cell.code .input-container .input");
    expect(component.find(".notebook .cell.code .outputs").length).to.be.above(
      0,
      ".notebook .cell.code .outputs"
    );
  });

  describe("getLanguageMode", () => {
    it("determines the right language from the notebook metadata", () => {
      const lang = getLanguageMode(dummyCommutable);
      expect(lang).to.equal("ipython");

      const lang2 = getLanguageMode(
        dummyCommutable.setIn(
          ["metadata", "language_info", "codemirror_mode", "name"],
          "r"
        )
      );
      expect(lang2).to.equal("r");
    });
  });

  describe("keyDown", () => {
    it("detects a cell execution keypress", () => {
      const focusedCell = dummyCommutable.getIn(["cellOrder", 1]);

      const context = {
        store: dummyStore()
      };

      context.store.dispatch = sinon.spy();

      const component = shallow(
        <Notebook
          notebook={dummyCommutable}
          transient={new Immutable.Map({ cellMap: new Immutable.Map() })}
          cellPagers={new Immutable.Map()}
          cellStatuses={dummyCellStatuses}
          stickyCells={new Immutable.Map()}
          CellComponent={Cell}
          cellFocused={focusedCell}
        />,
        { context }
      );

      const inst = component.instance();

      const evt = new window.CustomEvent("keydown");
      evt.ctrlKey = true;
      evt.keyCode = 13;

      inst.keyDown(evt);

      expect(context.store.dispatch.firstCall).to.have.been.calledWith({
        type: "EXECUTE_CELL",
        id: focusedCell,
        source: dummyCommutable.getIn(["cellMap", focusedCell, "source"])
      });
    });
    it("detects a focus to next cell keypress", () => {
      const focusedCell = dummyCommutable.getIn(["cellOrder", 1]);

      const context = {
        store: dummyStore()
      };

      context.store.dispatch = sinon.spy();

      const component = shallow(
        <Notebook
          notebook={dummyCommutable}
          transient={new Immutable.Map({ cellMap: new Immutable.Map() })}
          cellPagers={new Immutable.Map()}
          cellStatuses={dummyCellStatuses}
          stickyCells={new Immutable.Map()}
          CellComponent={Cell}
          cellFocused={focusedCell}
        />,
        { context }
      );

      const inst = component.instance();

      const evt = new window.CustomEvent("keydown");
      evt.shiftKey = true;
      evt.keyCode = 13;

      inst.keyDown(evt);

      expect(context.store.dispatch.firstCall).to.have.been.calledWith({
        type: "FOCUS_NEXT_CELL",
        id: focusedCell,
        createCellIfUndefined: true
      });
    });
  });
});
