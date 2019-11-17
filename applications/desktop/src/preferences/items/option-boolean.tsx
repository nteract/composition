import { ChangeEvent } from "react";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ConfigOptionBoolean, ConfigOptionEnum, setConfigAtKey } from "../../common/config";

import { PreferencesAppState } from "../setup/state";



export const isBoolean = (props: any): props is ConfigOptionBoolean =>
  "initial" in props &&
  typeof props.initial === "boolean";

const makeMapStateToProps =
  (state: PreferencesAppState, { id, values }: ConfigOptionBoolean) => ({
    checked: state.config.get(id) === (values || {true: true}).true,
  });

const makeMapDispatchToProps =
  (dispatch: Dispatch, { id }: ConfigOptionEnum) => ({
    makeSetValue: (value: any) =>
      (_event: ChangeEvent<HTMLInputElement>) =>
        dispatch(setConfigAtKey(id, value)),
  });

const PureBooleanOption = ({
  id,
  label,
  values,
  checked,
  makeSetValue,
}: ConfigOptionBoolean & { checked: boolean, makeSetValue: (value: any) => (event: ChangeEvent<HTMLInputElement>) => void}) =>
  <section>
    <h1>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        aria-checked={checked}
        onChange={makeSetValue(values ? values[!checked ? "true" : "false"] : !checked)}
      />
      &nbsp;
      <label htmlFor={id}>{label}</label>
    </h1>
  </section>;

export const BooleanOption = connect(
  makeMapStateToProps,
  makeMapDispatchToProps,
)(PureBooleanOption);

BooleanOption.displayName = "BooleanOption";
