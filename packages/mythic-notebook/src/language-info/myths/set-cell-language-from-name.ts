import * as actions from "@nteract/actions";
import { FETCH_CONTENT_FULFILLED, FetchContentFulfilled } from "@nteract/actions";
import { Cell, CodeCell } from "@nteract/commutable/lib/v4";
import { fromJS } from "immutable";
import { of } from "rxjs";
import { languageInfo } from "../package";
import { canonicalNameFromString, languageInfoFromCanonicalName } from "../pure/language-resolution";
import { CellAddress, cellAddressToIndex, LanguageNamePayload } from "../types";

export const setCellLanguageFromName = languageInfo.createMyth("setCellLanguageFromName")<
  LanguageNamePayload<CellAddress>
>({
  reduce: (state, action) => {
    if (action.payload.langName === undefined || action.payload.langName.trim() === "") {
      return state
        .deleteIn(["infoBy", "cell", cellAddressToIndex(action.payload.ref)])
        .deleteIn(["langBy", "cell", cellAddressToIndex(action.payload.ref)])
        .deleteIn(["textBy", "cell", cellAddressToIndex(action.payload.ref)]);
    }
    else {
      const name = canonicalNameFromString(action.payload.langName);
      return state
        .setIn(["infoBy", "cell", cellAddressToIndex(action.payload.ref)], fromJS(languageInfoFromCanonicalName(name)))
        .setIn(["langBy", "cell", cellAddressToIndex(action.payload.ref)], name)
        .setIn(["textBy", "cell", cellAddressToIndex(action.payload.ref)], action.payload.langName);
    }
  },
  thenDispatch: [
    action => of(
      actions.setInCell({
        ...action.payload.ref,
        path: ["metadata", "nteract", "languageName"],
        value: action.payload.langName === "" ? undefined : action.payload.langName,
      })
    ),
  ],
  andAlso: [
    {
      when: action => action.type === FETCH_CONTENT_FULFILLED,
      dispatch: (action, state, myth) => {
        const fcf = action as unknown as FetchContentFulfilled;
        return of(
          ...(fcf.payload.model.content?.cells ?? [])
            .filter(
              (each: Cell) => each.cell_type === "code" && each.id !== undefined
            )
            .map(
              (each: CodeCell) => myth.create({
                ref: {
                  contentRef: fcf.payload.contentRef,
                  id:         each.id!,
                },
                langName: (each.metadata?.nteract as any)?.languageName ?? undefined,
              })
            )
            .filter(
              (each: any) => each.payload.langName !== undefined
            )
        );
      },
    },
  ],
});
