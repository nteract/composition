import { RecordOf } from "immutable";
import { ChangeEvent } from "react";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";

import { ConfigOptionEnum, Configuration, ConfigurationState, setConfigAtKey } from "../../common/config";


export const isEnum = (props: any): props is ConfigOptionEnum =>
  "options" in props;

const makeMapStateToProps =
  (state: ConfigurationState, { id }: ConfigOptionEnum) => ({
    current: state.config.get(id),
  });

const makeMapDispatchToProps =
  (dispatch: Dispatch, { id }: ConfigOptionEnum) => ({
    makeSetValue: (value: any) => (event: ChangeEvent<HTMLInputElement>) =>
      dispatch(setConfigAtKey(id, value)),
  });

const PureEnumOption = ({
  id,
  label,
  initial,
  options,
  current,
  makeSetValue,
}: ConfigOptionEnum & {current: any, makeSetValue: (value: any) => (event: ChangeEvent<HTMLInputElement>) => void}) => {
  const isChecked = (value: any) => (
    value === current ||
    (initial instanceof Array && current.includes(value))
  );

  const setValue = (value: any) => {
    if (current instanceof Array) {
      if (isChecked(value)) {
        return makeSetValue(current.filter(x => x !== value));
      }
      else {
        return makeSetValue(current.concat([value]));
      }
    }
    else {
      if (isChecked(value)) {
        // do nothing; radio group switched away from us
        return () => undefined;
      }
      else {
        return makeSetValue(value);
      }
    }
  };
  console.log("options", options);
  return (
    <section>
      <h1>{label}</h1>
      {options.map(option =>
        <label key={option.value}>
          <h2>
            <input
              type={initial instanceof Array ? "checkbox" : "radio"}
              name={id}
              value={option.value}
              checked={isChecked(option.value)}
              onChange={setValue(option.value)}
            />
            &nbsp;
            {option.label}
          </h2>
          {(option.info || []).map(
            (each, i) => <div key={i} className="info">{each}</div>
          )}
        </label>
      )}
    </section>
  );
}

export const EnumOption = connect(
  makeMapStateToProps,
  makeMapDispatchToProps,
)(PureEnumOption);

EnumOption.displayName = "EnumOption";
