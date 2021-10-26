import { languageData } from "../data/languages";
import { LanguageInfoMetadata, LanguageName } from "../types";

export const canonicalNameFromLanguageInfo = (info: LanguageInfoMetadata): LanguageName => (
  searchMime(info.mimetype ?? "")
  ?? searchAlias(info.name ?? "")
  ?? searchExtension(info.fileExtension ?? "")
  ?? canonicalNameFromString(info.name ?? "")
);

export const canonicalNameFromString = (name: string): LanguageName => (
  searchMime(name)
  ?? searchAlias(name)
  ?? searchAlias(name.toLowerCase())
  ?? searchExtension(name)
  ?? searchExtension(name.toLowerCase())
  ?? searchExtension(`.${name.toLowerCase()}`)
);

export const languageInfoFromCanonicalName = (name: LanguageName) =>
  name === undefined ? undefined : languageData.info[name];

const searchMime      = (mime:      string) => ifUnique(languageData.mime [mime]);
const searchAlias     = (alias:     string) => ifUnique(languageData.alias[alias]);
const searchExtension = (extension: string) => ifUnique(languageData.ext  [extension]);

const ifUnique = (list: string[] | undefined) =>
  (list ?? []).length === 1 ? list![0] : undefined;
