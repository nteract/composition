import { ActionFactory, ActionHandler } from "./action";
import { CommandLocation } from "./locations";

export interface CommandSet<T, U> {
  appliesTo: (info: U) => boolean;
  location?: CommandLocation;
  commands: Array<CommandSpec<T, U>>;
}

export interface CommandSpec<T, U> {
  label: string;
  name: string;
  icon?: JSX.Element;
  keys?: string[];
  isEnabled?: (info: U) => boolean;
  isChecked?: (info: U) => boolean;
  actions: Array<ActionFactory<T>>;
}

export interface Command {
  data: {
    label: string;
    name: string;
    location: CommandLocation;
    icon?: JSX.Element;
    keys?: string[];
  };
  handler?: ActionHandler;
  location?: string;
  isEnabled: boolean;
  isChecked?: boolean;
}
