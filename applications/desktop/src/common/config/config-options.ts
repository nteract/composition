import { RecordOf } from "immutable";
import * as Immutable from "immutable";
import { ConfigOptions, Configuration } from "./schema";

export const ALL_CONFIG_OTIONS: ConfigOptions = [
  { heading: "Startup" },
  {
    id: "initialKernel",
    label: "Kernel on Startup",
    kind: "kernels",
    initial: "python3",
  },
  { heading: "Editor" },
  {
    id: "theme",
    label: "Theme",
    options: [
      { value: "light", label: "Light Theme" },
      { value: "dark", label: "Dark Theme" },
    ],
    initial: "light",
  },
  {
    id: "autocomplete",
    label: "Autocomplete",
    options: [
      { value: "typeahead", label: "Show suggestions as you type" },
    ],
    initial: [],
  },
  {
    id: "autoclose",
    label: "Automatically close",
    options: [
      { value: "quotes", label: "Quotes" },
      { value: "braces", label: "Braces" },
    ],
    initial: ["quotes", "braces"],
  },
  {
    id: "cursorBlinkRate",
    label: "Blink Editor Cursor",
    values: { true: 530, false: 0 },
    initial: false,
  },
];

const initial: Configuration = { kernelspecs: undefined };

ALL_CONFIG_OTIONS
  .filter(({ id }: any) => id)
  .forEach(({ id, initial: value }: any) => initial[id] = value);

export const INITIAL_CONFIGURATION: RecordOf<Configuration> =
  Immutable.Record<Configuration>(initial)();
