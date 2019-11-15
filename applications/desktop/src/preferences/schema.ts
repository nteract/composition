import { ConfigItem } from "./items";

export type ConfigSchema = ConfigItem[];

export const ALL_PREFERENCES: ConfigSchema = [
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
    id: "autoClose",
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
