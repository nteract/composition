//  new .ipnb file option in Right Click Menu on Linux

import { dialog } from "electron";

var fs = require('fs-extra');

var home = process.env['HOME'];
var tdir = '/Templates';
var fileName = '/Templates/New_ipython_file.ipynb';
var path = home+fileName;

// json data
var jsonData = '{"cells": [{"cell_type": "code","execution_count": null,"metadata": {},"outputs": [],"source": []}],"metadata": {"kernelspec": {"display_name": "Python 3","language": "python","name": "python3"}},"nbformat": 4,"nbformat_minor": 2}';
var jsonObj = JSON.parse(jsonData);

// stringify JSON Object
var jsonContent = JSON.stringify(jsonObj);

export const addRightClickMenu = () => {
	if (process.platform === "win32") {
    	dialog.showErrorBox(
      "This works only for Linux as of now .",
      "Other Platform will be supported in future"
    );
  } else{
      if (!fs.existsSync(home+tdir)){
	  fs.mkdirSync(home+tdir);
	  }
	else
	{
		console.log(" Templates directory Exists !!");
	}
	console.log(path);

	fs.outputFile(path,jsonContent, err => {
  	if (err) return console.error(err)
		dialog.showMessageBox({
        title: "Successfully installed.",
        message: 'You may now be able to create new .ipynb file from anywhere.',
        detail: 'Right Click and Select Create New_ipython_file.ipynb',
        buttons: ["OK"]
      	})
		})

}}
