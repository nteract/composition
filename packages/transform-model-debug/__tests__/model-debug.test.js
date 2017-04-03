import React from "react";
import Immutable from "immutable";

import { mount } from "enzyme";

import ModelDebug from "../src";

describe("ModelDebug", () => {
  it("renders all models when no modelID set", () => {
    const modelDebugWrapper = mount(
      <ModelDebug
        data={"hey"}
        models={Immutable.fromJS({ 1: { fun: true } })}
      />
    );

    const instance = modelDebugWrapper.instance();
    expect(instance.shouldComponentUpdate()).toBeTruthy();

    expect(
      modelDebugWrapper.contains(
        <pre>{JSON.stringify({ 1: { fun: true } }, null, 2)}</pre>
      )
    ).toEqual(true);
  });
});
