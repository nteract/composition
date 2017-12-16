/* @flow */
import type { L10nsStrings } from "../formatters/buildFormatter";

// Uzbek
const strings: L10nsStrings = {
  prefixAgo: null,
  prefixFromNow: "keyin",
  suffixAgo: "avval",
  suffixFromNow: null,
  seconds: "bir necha soniya",
  minute: "1 daqiqa",
  minutes: function(value) {
    return "%d daqiqa";
  },
  hour: "1 soat",
  hours: function(value) {
    return "%d soat";
  },
  day: "1 kun",
  days: function(value) {
    return "%d kun";
  },
  month: "1 oy",
  months: function(value) {
    return "%d oy";
  },
  year: "1 yil",
  years: function(value) {
    return "%d yil";
  },
  wordSeparator: " "
};

export default strings;
