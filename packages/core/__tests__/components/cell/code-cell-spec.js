import React from "react";

import { Provider } from "react-redux";
import { shallow, mount } from "enzyme";
import Immutable from "immutable";

import { dummyStore } from "../../../src/dummy";
import CodeCell from "../../../src/components/cell/code-cell";

import { emptyCodeCell } from "@nteract/commutable";
import { displayOrder, transforms } from "@nteract/transforms";

const sharedProps = { displayOrder, transforms };
describe("CodeCell", () => {
  test("can be rendered", () => {
    const cell = shallow(
      <CodeCell
        cell={emptyCodeCell}
        {...sharedProps}
        cellStatus={Immutable.Map({
          outputHidden: false,
          inputHidden: false,
          outputExpanded: false
        })}
        models={new Immutable.Map({})}
      />
    );
    expect(cell).not.toBeNull();
  });
  test("creates an editor", () => {
    const store = dummyStore();

    const cell = mount(
      <Provider store={store}>
        <CodeCell
          cell={emptyCodeCell}
          {...sharedProps}
          cellStatus={Immutable.Map({
            outputHidden: false,
            inputHidden: false,
            outputExpanded: false
          })}
          models={new Immutable.Map({})}
        />
      </Provider>
    );
    expect(cell.find(".input").length).toBeGreaterThan(0);
  });
  test("creates a pager", () => {
    const store = dummyStore();

    const cell = mount(
      <Provider store={store}>
        <CodeCell
          cell={emptyCodeCell}
          {...sharedProps}
          cellStatus={Immutable.Map({
            outputHidden: false,
            inputHidden: false,
            outputExpanded: false
          })}
          pagers={Immutable.fromJS([{ data: { "text/plain": "one" } }])}
          models={new Immutable.Map({})}
        />
      </Provider>
    );
    expect(cell.find(".pagers").length).toBeGreaterThan(0);
  });
});
