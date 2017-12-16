import test from "ava";
import React from "react";
import { shallow } from "enzyme";

import TimeAgo from "../src";
import buildFormatter from "../src/formatters/buildFormatter";
import TWStrings from "../src/language-strings/zh-TW";

test("just now", t => {
  const wrapper = shallow(<TimeAgo date={new Date()} />);
  t.is(wrapper.text(), "0 seconds ago");
});

test("1 second ago", t => {
  const wrapper = shallow(<TimeAgo date={Date.now() - 1000} />);
  t.is(wrapper.text(), "1 second ago");
});

test("2 seconds ago", t => {
  const wrapper = shallow(<TimeAgo date={Date.now() - 2000} />);
  t.is(wrapper.text(), "2 seconds ago");
});

test("1 minute ago", t => {
  const wrapper = shallow(<TimeAgo date={Date.now() - 1000 * 60} />);
  t.is(wrapper.text(), "1 minute ago");
});

test("2 minutes ago", t => {
  const wrapper = shallow(<TimeAgo date={Date.now() - 2000 * 60} />);
  t.is(wrapper.text(), "2 minutes ago");
});

test("1 hour ago", t => {
  const wrapper = shallow(<TimeAgo date={Date.now() - 1000 * 60 * 60} />);
  t.is(wrapper.text(), "1 hour ago");
});

test("2 hours ago", t => {
  const wrapper = shallow(<TimeAgo date={Date.now() - 2000 * 60 * 60} />);
  t.is(wrapper.text(), "2 hours ago");
});

test("1 day ago", t => {
  const wrapper = shallow(<TimeAgo date={Date.now() - 1000 * 60 * 60 * 24} />);
  t.is(wrapper.text(), "1 day ago");
});

test("1 week ago", t => {
  const wrapper = shallow(
    <TimeAgo date={Date.now() - 1000 * 60 * 60 * 24 * 7} />
  );
  t.is(wrapper.text(), "1 week ago");
});

/* ... */

/* zh-TW */
const formatter = buildFormatter(TWStrings);

/* 1 week ago in zh-TW */
test("1 week ago in zh-TW", t => {
  const wrapper = shallow(
    <TimeAgo
      date={Date.now() - 1000 * 60 * 60 * 24 * 7}
      formatter={formatter}
    />
  );
  t.is(wrapper.text(), "7天之前");
});

test("allow custom wordSeparator", t => {
  const strings = Object.assign({}, TWStrings, { wordSeparator: "x" });
  const formatter = buildFormatter(strings);
  const wrapper = shallow(
    <TimeAgo
      date={Date.now() - 1000 * 60 * 60 * 24 * 7}
      formatter={formatter}
    />
  );
  t.is(wrapper.text(), "7天x之前");
});
