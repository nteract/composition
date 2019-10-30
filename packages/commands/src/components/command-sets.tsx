import { DropdownContent, DropdownMenu, DropdownTrigger } from "@nteract/dropdown-menu";
import { ChevronDownOcticon } from "@nteract/octicons";
import * as React from "react";
import { ActionHandler, Command } from "../model";
import { CommandLocation } from "../model/locations";
import { CommandItem } from "./command-item";

export interface CommandSetsProps<T, U> {
  location: CommandLocation;
  target: T;
  dropdown?: boolean;
}

export interface InnerProps {
  location: CommandLocation;
  dropdown?: boolean;
  commands: Command[];
  handlers: Map<string, ActionHandler>;
}

const items =
  ({location, commands, handlers}: InnerProps) =>
    commands
      .filter(each => each.data.location === location)
      .map(each => <CommandItem
        key={each.data.name}
        handler={handlers.get(each.data.name)}
        {...each} />);

const DO_NOTHING_SINCE_OUR_CHILD_HANDLES_THAT = () => undefined;
  // The dropdown handler assumes the direct children have an onClick, but we
  // handle stuff deeper in the DOM. We have to define a noop to avoid errors.

export const CommandSets =
  (props: InnerProps) =>
    props.dropdown
      ?
        <div className={props.location}>
          <DropdownMenu>
            <DropdownTrigger>
              <button><ChevronDownOcticon/></button>
            </DropdownTrigger>
            <DropdownContent>
              {items(props).map(each => <li
                key={`li-${each.key}`}
                role="presentation" // Since we're doing nothing
                onClick={DO_NOTHING_SINCE_OUR_CHILD_HANDLES_THAT}
              >{each}</li>)}
            </DropdownContent>
          </DropdownMenu>
        </div>
      :
        <div className={props.location}>
          {items(props)}
        </div>;
