/* @flow */
import type { L10nsStrings } from "../formatters/buildFormatter";

// Serbian
function numpf(n, f, s, t) {
  var n10;
  n10 = n % 10;
  if (n10 === 1 && (n === 1 || n > 20)) {
    return f;
  } else if (n10 > 1 && n10 < 5 && (n > 20 || n < 10)) {
    return s;
  } else {
    return t;
  }
}

const strings: L10nsStrings = {
  prefixAgo: "пре",
  prefixFromNow: "за",
  suffixAgo: null,
  suffixFromNow: null,
  second: "секунд",
  seconds: function(value) {
    return numpf(value, "%d секунд", "%d секунде", "%d секунди");
  },
  minute: "један минут",
  minutes: function(value) {
    return numpf(value, "%d минут", "%d минута", "%d минута");
  },
  hour: "један сат",
  hours: function(value) {
    return numpf(value, "%d сат", "%d сата", "%d сати");
  },
  day: "један дан",
  days: function(value) {
    return numpf(value, "%d дан", "%d дана", "%d дана");
  },
  month: "месец дана",
  months: function(value) {
    return numpf(value, "%d месец", "%d месеца", "%d месеци");
  },
  year: "годину дана",
  years: function(value) {
    return numpf(value, "%d годину", "%d године", "%d година");
  },
  wordSeparator: " "
};

export default strings;
