import { RootState } from "@nteract/myths";

export * from "../types";

export interface LanguageInfoMetadata {
  name?:            string;
  fileExtension?:   string;
  mimetype?:        string;

  // There are more fields here that encode information for specific tools,
  // however, I don't think relying on them is the right decision. Hence,
  // they are omitted here. We do preserve them in the file, though.
}

export interface LanguageInfoCollection {
  [key: string]:    LanguageInfoMetadata;
}

export type LanguageName = string | undefined;  // undefined being an unknown language

export interface LanguageNameCollection {
  [key: string]:    LanguageName;
}

export interface LanguageInfoState {
  infoBy: {
    content:        LanguageInfoCollection;
    cell:           LanguageInfoCollection;
  };
  langBy: {
    content:        LanguageNameCollection;
    cell:           LanguageNameCollection;
  };
  textBy: {
    cell:           { [key: string]: string };
  };
}

export type HasPrivateLanguageInfoState =
  RootState<"language-info", LanguageInfoState>;

export interface LanguageInfoPayload<T> {
  ref:              T;
  langInfo:         LanguageInfoMetadata;
}

export interface LanguageNamePayload<T> {
  ref:              T;
  langName:         string;
}
