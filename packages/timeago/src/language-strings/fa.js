/* @flow */
import type { L10nsStrings } from "../formatters/buildFormatter";

// Persian
// Use DIR attribute for RTL text in Persian Language for ABBR tag .
// By MB.seifollahi@gmail.com
const strings: L10nsStrings = {
  prefixAgo: null,
  prefixFromNow: null,
  suffixAgo: "پیش",
  suffixFromNow: "از حال",
  seconds: "کمتر از یک دقیقه",
  minute: "حدود یک دقیقه",
  minutes: "%d دقیقه",
  hour: "حدود یک ساعت",
  hours: "حدود %d ساعت",
  day: "یک روز",
  days: "%d روز",
  month: "حدود یک ماه",
  months: "%d ماه",
  year: "حدود یک سال",
  years: "%d سال",
  wordSeparator: " "
};

export default strings;
