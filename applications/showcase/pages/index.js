// @flow
import { _nextgen } from "@nteract/core/components";

const {
  Cell,
  Input,
  Prompt,
  PromptBuffer,
  Editor,
  Outputs,
  Notebook
} = _nextgen;

import ReactMarkdown from "react-markdown";

import SyntaxHighlighter from "react-syntax-highlighter";

import {
  idea,
  agate,
  androidstudio,
  docco
} from "react-syntax-highlighter/dist/styles";

/** These are fake cell types for the purposes of demonstration **/
type CodeCell = {|
  code: string,
  outputs: any,
  running: boolean,
  queued: boolean,
  type: "code",
  executionCount?: number | null
|};

type MarkdownCell = {|
  code: string,
  type: "markdown",
  mode: "edit" | "view"
|};

type CellData = MarkdownCell | CodeCell;

type Cells = {
  [string]: CellData
};

const cells: Cells = {
  md: {
    type: "markdown",
    code:
      "# Exploring the world of Harry Potter\nAs we explore the gringotts data, we should make sure to _document_ our observations, assumptions, etc.",
    mode: "view"
  },
  abc: {
    code: "from hogwarts import characters;\ndisplay(characters)",
    outputs: (
      <div>
        <table>
          <thead>
            <tr>
              <th>id</th>
              <th>name</th>
              <th>bio</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>0</td>
              <td>Regulus Arcturus Black</td>
              <td>Brother of Sirius. Used to be a Death Eater but defected.</td>
            </tr>
            <tr>
              <td>1</td>
              <td>Sirius Black</td>
              <td>Best friend of James Potter and godfather of Harry.</td>
            </tr>
            <tr>
              <td>2</td>
              <td>Lavender Brown</td>
              <td>
                Killed by a werewolf. She was a gryffindor student who dated
                Ron.{" "}
              </td>
            </tr>
            <tr>
              <td>3</td>
              <td>Cho Chang</td>
              <td>
                Ravenclaw student who dated Cedric Diggory and Harry Potter.
              </td>
            </tr>
          </tbody>
        </table>
        <p>... 60 more entries</p>
        <style jsx>{`
          /* This is how you can tell this is a hokey demo */
          th {
            padding: 20px;
            text-align: left;
            vertical-align: middle;
            color: white;
            background-color: #111;
          }
          th:first-child {
            border-top-left-radius: 3px;
          }
          th:last-child {
            border-top-right-radius: 3px;
            border-right: none;
          }
          tr {
            font-weight: normal;
            background: #f8f8f8;
          }
          tr:hover td {
            background: #e7e7e7;
          }
          tr:first-child {
            border-top: none;
          }
          tr:last-child {
            border-bottom: none;
          }
          tr:nth-child(odd) td {
            background: #f0f0f0;
          }
          tr:nth-child(odd):hover td {
            background: #e7e7e7;
          }
          td {
            padding: 20px;
            text-align: left;
            vertical-align: middle;
          }
        `}</style>
      </div>
    ),
    running: false,
    queued: false,
    type: "code",
    executionCount: 0
  },
  bde: {
    code:
      "from gringotts import analyze_plots, harry_plotter\ndf = analyze_plots()",
    outputs: null,
    running: true,
    queued: false,
    type: "code",
    executionCount: null
  },
  gru: {
    code: "harry_plotter(df)",
    outputs: (
      <img
        src="http://i.dailymail.co.uk/i/pix/2016/07/08/00/360EA41C00000578-3679510-image-m-4_1467934667802.jpg"
        alt="harry plotter of the deathly hallows"
      />
    ),
    running: false,
    queued: true,
    type: "code"
  },
  md2: {
    type: "markdown",
    code:
      "There is a _lot_ more data around Harry Potter I'd **love to explore**. This is it for now I think... ",
    mode: "edit"
  }
};

const cellOrder = ["md", "abc", "bde", "gru", "md2"];

export const notebook = {
  cells,
  cellOrder,
  selected: "abc"
};

export const Example = () => (
  <Notebook selected="bde">
    {cellOrder.map(cellID => {
      const cell: CellData = cells[cellID];

      return (
        <Cell id={cellID} key={cellID}>
          {cell.type === "code" ||
          (cell.type === "markdown" && cell.mode === "edit") ? (
            <Input>
              {cell.type === "markdown" ? (
                <PromptBuffer />
              ) : (
                <Prompt
                  running={cell.running}
                  queued={cell.queued}
                  counter={cell.executionCount}
                />
              )}
              <Editor>
                <SyntaxHighlighter
                  style={idea}
                  language={cell.type === "markdown" ? "markdown" : "python"}
                  className={"input"}
                  customStyle={{
                    padding: "10px 0px 10px 10px",
                    margin: "0px",
                    backgroundColor: "var(--cm-background)"
                  }}
                >
                  {cell.code}
                </SyntaxHighlighter>
              </Editor>
            </Input>
          ) : null}
          <Outputs>
            {cell.type === "markdown" ? (
              <ReactMarkdown source={cell.code} />
            ) : (
              cell.outputs
            )}
          </Outputs>
        </Cell>
      );
    })}
  </Notebook>
);

const cellText = `<Cell>
  <Input>
    <Prompt counter={11} />
    <Editor>{"import wizardry\nwizardry.birthday()"}</Editor>
  </Input>
  <Outputs>
    <img
    src="https://i.ytimg.com/vi/YFNsRogBqb0/maxresdefault.jpg"
    width="200"
    />
    <h2>yer a wizard harry</h2>
  </Outputs>
</Cell>`;

const ExampleCell = () => (
  <Cell>
    <Input>
      <Prompt counter={11} />
      <Editor>{"import wizardry\nwizardry.birthday()"}</Editor>
    </Input>
    <Outputs>
      <img
        src="https://i.ytimg.com/vi/YFNsRogBqb0/maxresdefault.jpg"
        width="200"
        alt="'Yer a wizard Harry' -- Hagrid"
      />
      <h2>yer a wizard harry</h2>
    </Outputs>
    {/* WTF, how is color being set to white when this is a separate
      component in the eyes of styled-jsx */}
    <style jsx>{`
      color: black;
    `}</style>
  </Cell>
);

export default () => (
  <div className="root">
    <Example />
    <div className="explainer">
      <h1>On the left is a notebook</h1>
      <p>It was built with compound components like this</p>
      <SyntaxHighlighter style={agate}>{cellText}</SyntaxHighlighter>
      <p>The result of which is this component</p>
      <ExampleCell />
      <p>Neat, huh?</p>
    </div>
    <style jsx>{`
      .root {
        display: flex;
      }
      .root > :global(.cells) {
        width: 50%;
      }
      .explainer {
        background-color: black;
        color: white;
        flex: 1;
        font-family: "Source Sans Pro", Helvetica Neue, Helvetica, Arial,
          sans-serif;
        padding: 20px;
        border-left: 1px solid #e7e7e7;
      }
    `}</style>
  </div>
);
