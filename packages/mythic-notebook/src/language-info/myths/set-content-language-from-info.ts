import { FETCH_CONTENT_FULFILLED, FetchContentFulfilled, SET_KERNEL_INFO, SetKernelInfo } from "@nteract/actions";
import { fromJS } from "immutable";
import { of } from "rxjs";
import { languageInfo } from "../package";
import { canonicalNameFromLanguageInfo } from "../pure/language-resolution";
import { ContentRef, LanguageInfoPayload } from "../types";

export const setContentLanguageFromInfo = languageInfo.createMyth("setContentLanguageFromInfo")<
  LanguageInfoPayload<ContentRef>
>({
  reduce: (state, action) =>
    state
      .setIn(["infoBy", "content", action.payload.ref], fromJS(action.payload.langInfo))
      .setIn(["langBy", "content", action.payload.ref], canonicalNameFromLanguageInfo(action.payload.langInfo)),

  andAlso: [
    {
      when: action => action.type === FETCH_CONTENT_FULFILLED,
      dispatch: (action, state, myth) => {
        const fcf = action as unknown as FetchContentFulfilled;
        return of(
          myth.create({
            ref:              fcf.payload.contentRef,
            langInfo: {
              name:           fcf.payload.model?.content?.metadata?.language_info?.name,
              fileExtension:  fcf.payload.model?.content?.metadata?.language_info?.file_extension,
              mimetype:       fcf.payload.model?.content?.metadata?.language_info?.mimetype,
            },
          }),
        );
      },
    },
    {
      when: action => action.type === SET_KERNEL_INFO,
      dispatch: (action, state, myth) => {
        const ski = action as unknown as SetKernelInfo;
        return of(
          myth.create({
            ref:              ski.payload.contentRef,
            langInfo: {
              name:           ski.payload.info.languageName,
              fileExtension:  ski.payload.info.fileExtension,
              mimetype:       ski.payload.info.mimetype,
            },
          }),
        );
      },
    },
  ],
});
