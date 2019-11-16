import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";

import { PreferencesAppState } from "../setup/state";

export interface ConfigOptionBoolean {
  id: string;
  label: string;
  values?: {
    true: string | number | boolean;
    false: string | number | boolean;
  };
  initial: boolean;
}

export const isBoolean = (props: any): props is ConfigOptionBoolean =>
  "initial" in props &&
  typeof props.initial === "boolean";

const makeMapStateToProps =
  (state: PreferencesAppState, { id, values }: ConfigOptionBoolean) => ({
    checked: state.config.get(id) === (values || {true: true}).true,
  });

const makeMapDispatchToProps =
  (dispatch: Dispatch, { id, values }: ConfigOptionBoolean) => ({
  });

const PureBooleanOption = ({
  id,
  label,
  checked,
}: ConfigOptionBoolean & { checked: boolean }) =>
  <section>
    <h1>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        aria-checked={checked}
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
