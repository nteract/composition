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
  minutes: function() {
    return "%d daqiqa";
  },
  hour: "1 soat",
  hours: function() {
    return "%d soat";
  },
  day: "1 kun",
  days: function() {
    return "%d kun";
  },
  month: "1 oy",
  months: function() {
    return "%d oy";
  },
  year: "1 yil",
  years: function() {
    return "%d yil";
  },
  wordSeparator: " "
};

export default strings;
