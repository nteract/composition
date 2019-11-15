import * as React from "react";

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

export const BooleanOption = ({
  id,
  label,
  initial,
}: ConfigOptionBoolean) =>
  <section>
    <h1>
      <input
        type="checkbox"
        id={id}
        defaultChecked={initial}
        aria-checked={initial}
      />
      &nbsp;
      <label htmlFor={id}>{label}</label>
    </h1>
  </section>;

BooleanOption.displayName = "BooleanOption";
