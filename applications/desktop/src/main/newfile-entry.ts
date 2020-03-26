import { dialog } from "electron";
import {
  monocellNotebook,
  toJS
} from "@nteract/commutable";

let fs = require("fs-extra");
let path = require("path");

let home = process.env["HOME"];
let fileName = "/Templates/jupyter-notebook.ipynb";
let lpath = path.join(home + fileName);
let xx=toJS(monocellNotebook);
let jsonContent = JSON.stringify(xx);

export const addRightClickMenu = () => {
  if (process.platform === "win32") {
    dialog.showErrorBox(
      "This works only for Linux as of now .",
      "Other Platform will be supported in future"
    );
  } else {
    if (!fs.existsSync(path.dirname(lpath))) {
      fs.mkdirSync(path.dirname(lpath));
    }
    fs.outputFile(lpath, jsonContent, function(err:string) {
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
