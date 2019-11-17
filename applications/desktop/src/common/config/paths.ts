import { app, remote } from "electron";
import * as path from "path";

export const HOME = (app ? app : remote.app).getPath("home");
export const JUPYTER_CONFIG_DIR = path.join(HOME, ".jupyter");
export const CONFIG_FILE_PATH = path.join(JUPYTER_CONFIG_DIR, "nteract.json");
