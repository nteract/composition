// @flow
/* eslint jsx-a11y/no-static-element-interactions: 0 */
/* eslint jsx-a11y/click-events-have-key-events: 0 */
/* eslint jsx-a11y/no-noninteractive-element-interactions: 0 */

import * as React from "react";
import { mount } from "enzyme";
import toJSON from "enzyme-to-json";

import { DropdownMenu, DropdownContent, DropdownTrigger } from "../src";

describe("DropdownMenu", () => {
  test("clicking dropdown content triggers the items callback and closes the menu", () => {
    const clicky = jest.fn();

    const wrapper = mount(
      <DropdownMenu>
        <DropdownTrigger>
          <div className="clickMe">Click me</div>
        </DropdownTrigger>
        <DropdownContent>
          <li className="alsoClickMe" onClick={clicky}>
            1
          </li>
        </DropdownContent>
      </DropdownMenu>
    );

    expect(toJSON(wrapper)).toMatchSnapshot();

    // Trigger should be shown
    // Content should not be available yet
    expect(toJSON(wrapper)).toMatchSnapshot();
    expect(wrapper.find(".alsoClickMe").length).toEqual(0);

    // Content should now be shown
    wrapper.find(".clickMe").simulate("click");
    expect(toJSON(wrapper)).toMatchSnapshot();
    expect(wrapper.find(".alsoClickMe").length).toEqual(1);

    // Clicking the item should close the menu
    wrapper.find(".alsoClickMe").simulate("click");
    expect(wrapper.find(".alsoClickMe").length).toEqual(0);
    expect(toJSON(wrapper)).toMatchSnapshot();
  });
});
