import { MythicAction } from "@nteract/myths";
import { of } from "rxjs";
import { notifications } from "../package";
import { NotificationMessage } from "../types";

const prefixSlash = /.*\//;
const camelCase = /([a-z])([A-Z])/g;
const underscores = /_/g;

const titleFromAction = (action: MythicAction) => {
  const text = action.type
    .replace(prefixSlash, "")
    .replace(camelCase, (...x: string[]) => `${x[1]} ${x[2]}`)
    .replace(underscores, " ");
  return (
    text.charAt(0).toUpperCase() +
    text.substr(1).toLowerCase()
  );
};

const messageFromAction = (action: MythicAction) =>
  (action as any)?.payload?.error?.message
  ?? (action as any)?.payload?.message
  ?? JSON.stringify((action as any)?.payload ?? action, null, 2);

export const sendNotification =
  notifications.createMyth("sendNotification")<NotificationMessage>({
    reduce: (state, action) =>
      state.current.addNotification(action.payload),

    andAlso: [
      {
        when: action => action.error ?? false,
        dispatch: (action, _, sendNotificationMyth) => of(
          sendNotificationMyth.create({
            title: titleFromAction(action),
            message: messageFromAction(action),
            level: "error",
          }),
        ),
      },
    ],
  });
