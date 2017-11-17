import React from "react";

import { shallow } from "enzyme";

import DraggableCell from "../../src/components/draggable-cell";

import { emptyMarkdownCell } from "@nteract/commutable";

import { displayOrder, transforms } from "@nteract/transforms";

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
  test("can be rendered", () => {
    const cell = shallow(
      <DraggableCell cell={emptyMarkdownCell} {...sharedProps} />,
      {
        context: { dragDropManager }
      }
    );
    expect(cell).not.toBeNull();
  });
});
