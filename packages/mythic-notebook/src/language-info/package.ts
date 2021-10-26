import { createMythicPackage } from "@nteract/myths";
import { LanguageInfoState } from "./types";

export const languageInfo = createMythicPackage("language-info")<LanguageInfoState>({
  initialState: {
    infoBy: {
      content:  {},
      cell:     {},
    },
    langBy: {
      content:  {},
      cell:     {},
    },
    textBy: {
      cell:     {},
    }
  },
});
