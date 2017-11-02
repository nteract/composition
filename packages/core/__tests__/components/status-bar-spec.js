import React from "react";

import { shallow } from "enzyme";

import StatusBar from "../../../src/notebook/components/status-bar";
import { dummyCommutable } from "dummy-nb";

describe("StatusBar", () => {
  test("can render on a dummyNotebook", () => {
    const lastSaved = new Date();
    const kernelSpecDisplayName = "python3";

    const component = shallow(
      <StatusBar
        notebook={dummyCommutable}
        lastSaved={lastSaved}
        kernelSpecDisplayName={kernelSpecDisplayName}
      />
    );

    expect(component).not.toBeNull();
  });
  test("no update if an irrelevant prop has changed", () => {
    const lastSaved = new Date();
    const kernelSpecDisplayName = "python3";

    const component = shallow(
      <StatusBar
        notebook={dummyCommutable}
        lastSaved={lastSaved}
        kernelSpecDisplayName={kernelSpecDisplayName}
      />
    );

    const shouldUpdate = component.instance().shouldComponentUpdate({
      lastSaved,
      kernelSpecDisplayName: "javascript",
      notebook: dummyCommutable
    });
    expect(shouldUpdate).toBe(false);
  });
  test("update if an irrelevant prop has changed", () => {
    const lastSaved = new Date();
    const kernelSpecDisplayName = "python3";

    const component = shallow(
      <StatusBar
        notebook={dummyCommutable}
        lastSaved={lastSaved}
        kernelSpecDisplayName={kernelSpecDisplayName}
      />
    );

    const shouldUpdate = component.instance().shouldComponentUpdate({
      lastSaved: new Date(),
      kernelSpecDisplayName: "python3",
      notebook: dummyCommutable
    });
    expect(shouldUpdate).toBe(true);
  });
});
