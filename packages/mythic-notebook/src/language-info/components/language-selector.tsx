import { EditableText } from "@blueprintjs/core";
import { MythicComponent } from "@nteract/myths";
import React from "react";
import styled from "styled-components";
import { CellAddress } from "../../types";
import { setCellLanguageFromName } from "../myths/set-cell-language-from-name";
import { languageOfCellOnly } from "../selectors";

const LeftRightLayout =
  styled.div`
    display: flex;
    flex-grow: 1;
    
    & > *:nth-child(1) {
      flex-grow: 1;
    }
    
    & > *:nth-child(2) {
      & > * {
        text-align: right;
      }
      
      & > input {
        color: black;
        background: white;
        opacity: 50%;
      }
    }
  `;

export const LanguageSelector =
  setCellLanguageFromName.createConnectedComponent(
    "LanguageSelector",
    class extends MythicComponent<
      typeof setCellLanguageFromName,
      {cellAddress: CellAddress, language?: string}
    > {
      render(): JSX.Element {
        const onTextChange = (text: string) =>
          this.props.setCellLanguageFromName({ref: this.props.cellAddress, langName: text});

        return (
          <LeftRightLayout className="set-cell-language">
            <output>{this.props.language}</output>
            <EditableText
              selectAllOnFocus={true}
              placeholder="Set cell language..."
              onChange={onTextChange}
            />
          </LeftRightLayout>
        );
      }

      onTextChange(text: string) {
        this.props.setCellLanguageFromName({ref: this.props.cellAddress, langName: text});
      }
    },
    (state, { cellAddress }) => ({
      language: languageOfCellOnly(state, cellAddress),
    }),
  );
