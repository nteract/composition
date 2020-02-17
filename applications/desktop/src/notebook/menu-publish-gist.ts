import { actions } from "@nteract/core";
import { sendNotification } from "@nteract/mythic-notifications";
import { ContentRef } from "@nteract/types";
import { DesktopStore } from "./store";

export function dispatchPublishGist(
  ownProps: { contentRef: ContentRef },
  store: DesktopStore,
  _event: Event
): void {
  const state = store.getState();
  const githubToken = state.app.get("githubToken");

  // The simple case -- we have a token and can publish
  if (githubToken != null) {
    store.dispatch(actions.publishGist(ownProps));
    return;
  }

  // If the Github Token isn't set, use our oauth server to acquire a token
  store.dispatch(sendNotification.create({
    key: "github-publish",
    icon: "book",
    title: "Publishing Gist",
    message: "Authenticating...",
    level: "in-progress"
  }));

  // Because the remote object from Electron main <--> renderer can be
  // "cleaned up"
  const electronRemote = require("electron").remote;

  // Create our oauth window
  const win = new electronRemote.BrowserWindow({
    show: false,
    webPreferences: { zoomFactor: 0.75, nodeIntegration: true }
  });

  // TODO: This needs to be moved to an epic
  win.webContents.on("dom-ready", () => {
    // When we're at our callback code page, keep the page hidden
    if (win.webContents.getURL().indexOf("callback?code=") !== -1) {
      // Extract the text content
      win.webContents.executeJavaScript(
        "require('electron').ipcRenderer.send('auth', " +
        "document.body.textContent);"
      );
      electronRemote.ipcMain.on("auth", (_authEvent: Event, auth: string) => {
        try {
          const accessToken = JSON.parse(auth).access_token;
          store.dispatch(actions.setGithubToken(accessToken));
          store.dispatch(sendNotification.create({
            key: "github-publish",
            icon: "book",
            title: "Publishing Gist",
            message: "Authenticated 🔒",
            level: "in-progress"
          }));
          // We are now authenticated and can finally publish
          store.dispatch(actions.publishGist(ownProps));
        } catch (e) {
          store.dispatch(actions.coreError(e));
        } finally {
          win.close();
        }
      });
    } else {
      win.show();
    }
  });
  win.loadURL("https://oauth.nteract.io/github");
}