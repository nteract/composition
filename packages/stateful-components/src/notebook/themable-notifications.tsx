import { NotificationRoot } from "@nteract/mythic-notifications";
import { AppState } from "@nteract/types";
import React from "react";
import { connect } from "react-redux";
import { getTheme } from "../decorators/themer";

interface Props {
  theme: string;
}

const PureThemableNotifications = ({ theme }: Props) =>
  <NotificationRoot darkTheme={theme === "dark"}/>;

export const ThemableNotifications = connect(
  (state: AppState) => ({theme: getTheme(state)}),
)(PureThemableNotifications);
ThemableNotifications.displayName = "ThemableNotifications";
