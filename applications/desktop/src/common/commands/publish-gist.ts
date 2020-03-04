import { actions } from "@nteract/core";
import { sendNotification } from "@nteract/mythic-notifications";
import { authenticate } from "../auth";
import { DesktopCommand, RequiresContent } from "./contents";

const makeGithubNotification = (message: string) =>
  sendNotification.with({
    level: "in-progress",
    key: "github-publish",
    icon: "book",
    title: "Publishing Gist",
    message,
  });

export const PublishGist: DesktopCommand<RequiresContent> = {
  async *makeActionTemplates(store) {
    if (!store.getState().app.get("githubToken")) {
      yield makeGithubNotification("Authenticating...");

      yield actions.setGithubToken.with({
        githubToken: await authenticate("github"),
      });

      yield makeGithubNotification("Authenticated 🔒");
    }

    yield actions.publishGist;
  },
};
