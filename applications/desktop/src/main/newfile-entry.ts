import { dialog } from "electron";
let fs = require("fs-extra");
let path = require("path");

let home = process.env["HOME"];
let fileName = "/Templates/jupyter-notebook.ipynb";
let lpath = path.join(home + fileName);

let jsonData =
  '{"cells": [{"cell_type": "code","execution_count": null,"metadata": {},"outputs": [],"source": []}],"metadata": {"kernelspec": {"display_name": "Python 3","language": "python","name": "python3"}},"nbformat": 4,"nbformat_minor": 2}';
let jsonObj = JSON.parse(jsonData);
let jsonContent = JSON.stringify(jsonObj);

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

    fs.outputFile(lpath, jsonContent, function(err) {
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
