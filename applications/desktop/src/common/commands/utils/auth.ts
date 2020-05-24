export type AuthTarget =
  | "github"
  ;

export const authenticate = async (target: AuthTarget) => {
  // Because the remote object from Electron main <--> renderer can be
  // "cleaned up"
  const electronRemote = require("electron").remote;
  const win = new electronRemote.BrowserWindow({
    show: false,
    webPreferences: { zoomFactor: 0.75, nodeIntegration: true },
  });

  return await new Promise<string>(
    (resolve, reject) => {
      win.webContents.on("dom-ready", () => {
        // When we're at our callback code page, keep the page hidden
        if (win.webContents.getURL().indexOf("callback?code=") !== -1) {
          win.webContents.executeJavaScript(`
            require('electron').ipcRenderer.send(
              'auth:${target}', document.body.textContent
            );
          `);
          electronRemote.ipcMain.on(`auth:${target}`,
            (_: Event, auth: string) => {
              try {
                resolve(JSON.parse(auth).access_token);
              } catch (e) {
                reject(e);
              } finally {
                win.close();
              }
            }
          );
        }
        // We're not on the callback code page, so we are like at a login page
        // => show to user
        else {
          win.show();
        }
      });
      win.loadURL(`https://oauth.nteract.io/${target}`);
    }
  );
};
