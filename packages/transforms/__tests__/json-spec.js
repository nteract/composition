import React from "react";
import JSONTree from "react-json-tree";

import { shallow } from "enzyme";

import JsonDisplay from "../src/json";

const baseData = { name: "Octocat" };

describe("JsonDisplay", () => {
  it("renders a <JSONTree /> component", () => {
    const component = shallow(<JsonDisplay data={baseData} theme="light" />);
    expect(component.find(JSONTree).length).toBe(1);
  });

  it("should not expand json tree by default", () => {
    const component = shallow(<JsonDisplay data={baseData} theme="light" />);
    const instance = component.instance();
    expect(instance.shouldExpandNode()).toBeFalsy();
  });

  it("should expand json tree if expanded metadata is true", () => {
    const metadata = { expanded: true };
    const component = shallow(
      <JsonDisplay data={baseData} theme="light" metadata={metadata} />
    );
    const instance = component.instance();
    expect(instance.shouldExpandNode()).toBeTruthy();
  });

  it("shouldComponentUpdate returns false if theme doesn't change", () => {
    const component = shallow(<JsonDisplay data={baseData} theme="light" />);
    const instance = component.instance();
    expect(
      instance.shouldComponentUpdate({
        theme: "light",
        data: baseData
      })
    ).toBeFalsy();
  });

  it("shouldComponentUpdate returns true if theme changes", () => {
    const component = shallow(<JsonDisplay data={baseData} theme="light" />);
    const instance = component.instance();
    expect(instance.shouldComponentUpdate({ theme: "dark" })).toBeTruthy();
  });
});
