import React from "react";
import { shallow } from "enzyme";

import TimeAgo from "../src";
import buildFormatter from "../src/formatters/buildFormatter";
import TWStrings from "../src/language-strings/zh-TW";

describe("TimeAgo", () => {
  test("just now", () => {
    const wrapper = shallow(<TimeAgo date={new Date()} />);
    expect(wrapper.text()).toEqual("0 seconds ago");
  });

  test("1 second ago", () => {
    const wrapper = shallow(<TimeAgo date={Date.now() - 1000} />);
    expect(wrapper.text()).toEqual("1 second ago");
  });

  test("2 seconds ago", () => {
    const wrapper = shallow(<TimeAgo date={Date.now() - 2000} />);
    expect(wrapper.text()).toEqual("2 seconds ago");
  });

  test("1 minute ago", () => {
    const wrapper = shallow(<TimeAgo date={Date.now() - 1000 * 60} />);
    expect(wrapper.text()).toEqual("1 minute ago");
  });

  test("2 minutes ago", () => {
    const wrapper = shallow(<TimeAgo date={Date.now() - 2000 * 60} />);
    expect(wrapper.text()).toEqual("2 minutes ago");
  });

  test("1 hour ago", () => {
    const wrapper = shallow(<TimeAgo date={Date.now() - 1000 * 60 * 60} />);
    expect(wrapper.text()).toEqual("1 hour ago");
  });

  test("2 hours ago", () => {
    const wrapper = shallow(<TimeAgo date={Date.now() - 2000 * 60 * 60} />);
    expect(wrapper.text()).toEqual("2 hours ago");
  });

  test("1 day ago", () => {
    const wrapper = shallow(
      <TimeAgo date={Date.now() - 1000 * 60 * 60 * 24} />
    );
    expect(wrapper.text()).toEqual("1 day ago");
  });

  test("1 week ago", () => {
    const wrapper = shallow(
      <TimeAgo date={Date.now() - 1000 * 60 * 60 * 24 * 7} />
    );
    expect(wrapper.text()).toEqual("1 week ago");
  });

  /* ... */

  /* zh-TW */
  const formatter = buildFormatter(TWStrings);

  /* 1 week ago in zh-TW */
  test("1 week ago in zh-TW", () => {
    const wrapper = shallow(
      <TimeAgo
        date={Date.now() - 1000 * 60 * 60 * 24 * 7}
        formatter={formatter}
      />
    );
    expect(wrapper.text()).toEqual("7天之前");
  });

  test("allow custom wordSeparator", () => {
    const strings = Object.assign({}, TWStrings, { wordSeparator: "x" });
    const formatter = buildFormatter(strings);
    const wrapper = shallow(
      <TimeAgo
        date={Date.now() - 1000 * 60 * 60 * 24 * 7}
        formatter={formatter}
      />
    );
    expect(wrapper.text()).toEqual("7天x之前");
  });
});
