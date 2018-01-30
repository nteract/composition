/* eslint-disable max-len */
import React from "react";
import Immutable from "immutable";
import { Provider } from "react-redux";
import { shallow, mount } from "enzyme";

import renderer from "react-test-renderer";

import { displayOrder, transforms } from "@nteract/transforms";
import {
  NotebookApp,
  getCodeMirrorMode
} from "../../src/providers/notebook-app";

import { dummyStore, dummyCommutable } from "../../src/dummy";

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
    const stickyCells = new Immutable.Set().add(
      dummyCommutable.getIn(["cellOrder", 0])
    );

    const component = shallow(
      <NotebookApp
        cellOrder={dummyCommutable.get("cellOrder")}
        cellMap={dummyCommutable.get("cellMap")}
        transient={new Immutable.Map({ cellMap: new Immutable.Map() })}
        cellPagers={new Immutable.Map()}
        cellStatuses={new Immutable.Map()}
        // Sticky the first cell of the notebook so that the sticky code gets
        // triggered.
        stickyCells={stickyCells}
      />
    );
    expect(component).not.toBeNull();
  });

  describe("getCodeMirrorMode", () => {
    test("determines the right mode from the notebook metadata", () => {
      const mode = getCodeMirrorMode(dummyCommutable.get("metadata"));
      expect(mode).toEqual(Immutable.fromJS({ name: "ipython", version: 3 }));

      const lang2 = getCodeMirrorMode(
        dummyCommutable
          .setIn(["metadata", "language_info", "codemirror_mode", "name"], "r")
          .get("metadata")
      );
      expect(lang2).toEqual(Immutable.fromJS({ name: "r", version: 3 }));
    });
  });
});
