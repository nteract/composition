import { ChangeEvent } from "react";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { actions } from "../../common/use-cases";
import { PreferencesAppState } from "../setup/state";

export interface ConfigOptionEnum {
  id: string;
  label: string;
  options: Array<{
    value: string | number;
    label: string;
  }>;
  initial: string | number | Array<string | number>;
}

export const isEnum = (props: any): props is ConfigOptionEnum =>
  "options" in props;

const makeMapStateToProps =
  (state: PreferencesAppState, { id }: ConfigOptionEnum) => ({
    current: state.config.get(id),
  });

const makeMapDispatchToProps =
  (dispatch: Dispatch, { id }: ConfigOptionEnum) => ({
    makeSetValue: (value: any) => (event: ChangeEvent<HTMLInputElement>) => {
      if (event.target.checked) {
        dispatch(actions.setConfigAtKey(id, value));
      }
    },
  });

const PureEnumOption = ({
  id,
  label,
  initial,
  options,
  current,
  makeSetValue,
}: ConfigOptionEnum & {current: any, makeSetValue: (value: any) => (event: ChangeEvent<HTMLInputElement>) => void}) =>
  <section>
    <h1>{label}</h1>
    {options.map(option =>
      <div key={option.value}>
        <label>
          <input
            type={initial instanceof Array ? "checkbox" : "radio"}
            name={id}
            value={option.value}
            checked={option.value === current || (initial instanceof Array && current.includes(option.value))}
            onChange={makeSetValue(option.value)}
          />
          &nbsp;
          {option.label}
        </label>
      </div>)}
  </section>;

export const EnumOption = connect(
  makeMapStateToProps,
  makeMapDispatchToProps,
)(PureEnumOption);

EnumOption.displayName = "EnumOption";
