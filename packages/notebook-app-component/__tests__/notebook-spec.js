/* eslint-disable max-len */
import React from "react";
import Immutable from "immutable";
import { shallow } from "enzyme";

import { NotebookApp } from "../src/notebook-app";

import { dummyStore, dummyCommutable } from "@nteract/core/dummy";

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
describe("NotebookApp", () => {
  test("accepts an Immutable.List of cells", () => {
    const component = shallow(
      <NotebookApp
        cellOrder={dummyCommutable.get("cellOrder")}
        cellMap={dummyCommutable.get("cellMap")}
        transient={new Immutable.Map({ cellMap: new Immutable.Map() })}
        cellPagers={new Immutable.Map()}
        cellStatuses={new Immutable.Map()}
      />
    );
    expect(component).not.toBeNull();
  });

  describe("keyDown", () => {
    test("detects a cell execution keypress", () => {
      const focusedCell = dummyCommutable.getIn(["cellOrder", 1]);

      const context = { store: dummyStore() };

      context.store.dispatch = jest.fn();
      const executeFocusedCell = jest.fn();
      const component = shallow(
        <NotebookApp
          cellOrder={dummyCommutable.get("cellOrder")}
          cellMap={dummyCommutable.get("cellMap")}
          transient={new Immutable.Map({ cellMap: new Immutable.Map() })}
          cellPagers={new Immutable.Map()}
          cellStatuses={dummyCellStatuses}
          cellFocused={focusedCell}
          executeFocusedCell={executeFocusedCell}
        />,
        { context }
      );

      const inst = component.instance();

      const evt = new window.CustomEvent("keydown");
      evt.ctrlKey = true;
      evt.keyCode = 13;

      inst.keyDown(evt);

      expect(executeFocusedCell).toHaveBeenCalled();
    });
    test("detects a focus to next cell keypress", () => {
      const focusedCell = dummyCommutable.getIn(["cellOrder", 1]);

      const context = { store: dummyStore() };

      context.store.dispatch = jest.fn();
      const executeFocusedCell = jest.fn();
      const focusNextCell = jest.fn();
      const focusNextCellEditor = jest.fn();
      const component = shallow(
        <NotebookApp
          cellOrder={dummyCommutable.get("cellOrder")}
          cellMap={dummyCommutable.get("cellMap")}
          transient={new Immutable.Map({ cellMap: new Immutable.Map() })}
          cellPagers={new Immutable.Map()}
          cellStatuses={dummyCellStatuses}
          cellFocused={focusedCell}
          executeFocusedCell={executeFocusedCell}
          focusNextCell={focusNextCell}
          focusNextCellEditor={focusNextCellEditor}
        />,
        { context }
      );

      const inst = component.instance();

      const evt = new window.CustomEvent("keydown");
      evt.shiftKey = true;
      evt.keyCode = 13;

      inst.keyDown(evt);

      expect(executeFocusedCell).toHaveBeenCalled();
      expect(focusNextCell).toHaveBeenCalled();
      expect(focusNextCellEditor).toHaveBeenCalled();
    });
  });
});
