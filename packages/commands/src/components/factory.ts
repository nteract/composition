import { AppState } from "@nteract/types";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ActionHandler, Command, CommandLocation, CommandSet } from "../model";
import { CommandSets, CommandSetsProps } from "./command-sets";

export const makeCommandSetsComponent =
  <T, U, V>(
    makeInfo: (model: V | undefined) => U,
    makeModel: (state: AppState, ref: T) => V | undefined,
    sets: Array<CommandSet<T, U>>,
  ) =>
    connect(
      (state: AppState, props: CommandSetsProps<T, U>) => ({
        commands:
          mapAppStateToCommands(state, props.target, makeModel, makeInfo, sets),
      }),
      (dispatch: Dispatch, props: CommandSetsProps<T, U>) => ({
        handlers:
          mapDispatchToCommands(dispatch, props.target, sets),
      }),
    )(CommandSets);

function mapAppStateToCommands<T, U, V>(
  state: AppState,
  target: T,
  makeModel: (state: AppState, ref: T) => V | undefined,
  makeInfo: (model: V | undefined) => U,
  commandSets: Array<CommandSet<T, U>>,
): Command[] {
  const info = makeInfo(makeModel(state, target));

  return commandSets
    .filter(each => each.appliesTo(info))
    .map(each =>
      each.commands.map(
        command => Object.assign(
          {location: each.location || "nowhere"},
          command,
        )
      )
    )
    .reduce((acc, val) => acc.concat(val), []) // .flat(), where are you?!?
    .map(each => ({
      data: each,
      isEnabled:
        each.isEnabled === undefined
          ? true
          : each.isEnabled(info),
      isChecked:
        each.isChecked === undefined
          ? undefined
          : each.isChecked(info),
    } as Command));
}

function mapDispatchToCommands<T, U>(
  dispatch: Dispatch,
  target: T,
  commandSets: Array<CommandSet<T, U>>,
): Map<string, ActionHandler> {
  const handlers = new Map<string, ActionHandler>();

  commandSets
    .map(each => each.commands)
    .reduce((acc, val) => acc.concat(val), []) // .flat(), where are you?!?
    .forEach(each =>
      handlers.set(each.name, () =>
        each.actions
          .map(factory => factory(target))
          .forEach(dispatch))
    );

  return handlers;
}
