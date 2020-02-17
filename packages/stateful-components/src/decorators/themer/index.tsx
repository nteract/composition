import { AppState } from "@nteract/core";
import { createConfigOption } from "@nteract/mythic-configuration";
import { DarkTheme, LightTheme } from "@nteract/presentational-components";
import React from "react";
import { connect } from "react-redux";

export const {
  selector: getTheme,
  action: setTheme,
} = createConfigOption("theme")("light");

interface ComponentProps {
  children: React.ReactNode;
}

interface StateProps {
  theme: string;
}

export const Themer = ({ theme, children }: ComponentProps & StateProps) =>
  <>
    {children}
    {theme === "dark"
      ? <DarkTheme/>
      : <LightTheme/>}
  </>;
Themer.displayName = "Themer";

const makeMapStateToProps = (state: AppState) => ({
  theme: getTheme(state)
});

export default connect(makeMapStateToProps)(Themer);
