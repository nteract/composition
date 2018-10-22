import React from "react";
import { shallow } from "enzyme";
import { dummyCommutable } from "@nteract/core/dummy";

import { StatusBar } from "../src/status-bar";

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
