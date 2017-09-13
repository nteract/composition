import React from "react";

import { shallow } from "enzyme";
import { expect } from "chai";

import DraggableCell from "../../../src/notebook/views/draggable-cell";

import { emptyMarkdownCell } from "@nteract/commutable";

import { displayOrder, transforms } from "@nteract/transforms-full";

// Spoof DND manager for tests.
const dragDropManager = {
  getMonitor: () => ({
    subscribeToStateChange: () => {},
    isDraggingSource: () => {}
  }),
  getBackend: () => {},
  getRegistry: () => ({
    addSource: () => {},
    removeSource: () => {}
  })
};

const sharedProps = { displayOrder, transforms };
describe("DraggableCell", () => {
  it("can be rendered", () => {
    const cell = shallow(
      <DraggableCell cell={emptyMarkdownCell} {...sharedProps} />,
      {
        context: { dragDropManager }
      }
    );
    expect(cell).to.not.be.null;
  });
});
