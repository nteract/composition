import * as React from "react";
import styled from "styled-components";
import { Command } from "../model";

const CommandItemStyle = styled.div`
  button.text, label {
    width: 100%;
    height: inherit;
    font-size: 15px;
    color: var(--theme-cell-menu-fg);
    text-align: left;
    
    &[disabled] {
      opacity: 0.5;
    }
  
    &:hover {
      color: var(--theme-cell-menu-fg-hover);
    }    
  
    &[disabled]:hover {
      color: var(--theme-cell-menu-fg);
    }    
    
    display: block;
    padding: 0.5rem;
    margin: -0.5rem;
    padding-left: 0;
    margin-left: 15px;
    cursor: inherit;
  }
  
  label.checked::before {
    content: "✓";
    float: left;
    margin-left: -15px;
    font-weight: bold;
  }
  
  input[type="checkbox"] {
    float: left;
    margin-left: -15px;
    visibility: hidden;
  }
`;

const CommandCheckBox =
  ({data, isEnabled, isChecked, handler}: Command) =>
    <label key={data.name}
           className={[
             data.name,
             isChecked ? "checked" : "not-checked",
           ].join(" ")}
           onClick={handler}
           role="menuitemcheckbox"
           aria-checked={isChecked}>
      <input type="checkbox"
             onChange={handler}
             checked={isChecked}
             role="menuitemcheckbox"
             aria-checked={isChecked}
             disabled={!isEnabled}/>
      {data.label}
    </label>;

const CommandButton =
  ({data, isEnabled, handler}: Command) =>
    <button key={data.name}
            className={[
              data.name,
              data.icon ? "icon" : "text",
            ].join(" ")}
            onClick={handler}
            role="menuitem"
            disabled={!isEnabled}>
      {data.icon ? data.icon : data.label}
    </button>;

export const CommandItem = (props: Command) =>
  <CommandItemStyle>
    {props.isChecked !== undefined
      ? <CommandCheckBox {...props} />
      : <CommandButton {...props} />}
  </CommandItemStyle>;
