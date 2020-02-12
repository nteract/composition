import { selectors } from "@nteract/core";
import { theme } from "@nteract/mythic-configuration";
import { NotificationRoot } from "@nteract/mythic-notifications";
import { AppState } from "@nteract/types";
import React from "react";
import { connect } from "react-redux";

interface Props {
  theme: string;
}

const PureThemableNotifications = ({ theme }: Props) =>
  <NotificationRoot darkTheme={theme === "dark"}/>;

export const ThemableNotifications = connect(
  (state: AppState) => ({theme: theme(state)}),
)(PureThemableNotifications);
ThemableNotifications.displayName = "ThemableNotifications";
