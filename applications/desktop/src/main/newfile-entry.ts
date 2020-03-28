import { dialog } from "electron";
import { monocellNotebook, toJS } from "@nteract/commutable";
import fs from "fs-extra";
import path from "path";

/**
* Linux File Manager checks Templates file from either
* '/usr/share/templates' or 'home/Templates' (this case)
*/
const home = process.env["HOME"];
const fileName = "/Templates/jupyter-notebook.ipynb";
const lpath = path.join(home + fileName);
const jsonContent = JSON.stringify(toJS(monocellNotebook));

export const addRightClickMenu = () => {
  if (process.platform === "win32" || process.platform === "darwin") {
    dialog.showErrorBox(
      "Sorry!",
      "This feature is only supported on Linux. Other platforms will be supported in the future."
    );
  } else {
    if (!fs.existsSync(path.dirname(lpath))) {
      fs.mkdirSync(path.dirname(lpath));
    }
    fs.outputFile(lpath, jsonContent, function (err:string)  {
      if (err) return console.error(err);
      dialog.showMessageBox({
        title: "Successfully installed.",
        message: "You can now create new notebook files from anywhere.",
        detail: "Usage : Right Click >> Create New >> jupyter-notebook.ipynb",
        buttons: ["OK"]
      });
    });
  }
};
