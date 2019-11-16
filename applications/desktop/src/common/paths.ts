import { app, remote } from "electron";
import * as path from "path";

export const HOME = (app ? app : remote.app).getPath("home");
export const CONFIG_FILE_PATH = path.join(HOME, ".jupyter", "nteract.json");
