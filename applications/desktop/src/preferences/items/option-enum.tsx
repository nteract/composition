import * as React from "react";

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

export const EnumOption = ({
  id,
  label,
  initial,
  options,
}: ConfigOptionEnum) =>
  <section>
    <h1>{label}</h1>
    {options.map(option =>
      <div key={option.value}>
        <label>
          <input
            type={initial instanceof Array ? "checkbox" : "radio"}
            name={id}
            value={option.value}
            defaultChecked={option.value === initial || (initial instanceof Array && initial.includes(option.value))}
            aria-checked={option.value === initial || (initial instanceof Array && initial.includes(option.value))}
          />
          &nbsp;
          {option.label}
        </label>
      </div>)}
  </section>;

EnumOption.displayName = "EnumOption";
