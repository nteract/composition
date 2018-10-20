// @flow
import * as React from "react";

import { HTMLTransform } from "@nteract/transforms";

import { Source } from "@nteract/presentational-components";

const d3 = Object.assign({}, require("d3-dsv"));

const Text = (props: { data: string }) => (
  <React.Fragment>
    <code>{props.data}</code>
    <style jsx>{`
      code {
        white-space: pre;
      }
    `}</style>
  </React.Fragment>
);

const HokeyTable = props => (
  <React.Fragment>
    <style jsx>{`
      table {
        border-collapse: collapse;
        border-spacing: 0;
        border-collapse: collapse;
        border-spacing: 0;
        empty-cells: show;
        border: 1px solid #cbcbcb;
        max-height: 200px;
        overflow-y: scroll;
      }

      td,
      th {
        padding: 0;
        border-left: 1px solid #cbcbcb; /*  inner column border */
        border-width: 0 0 0 1px;
        font-size: inherit;
        margin: 0;
        overflow: visible; /*to make ths where the title is really long work*/
        padding: 0.5em 1em; /* cell padding */
      }

      td:first-child,
      th:first-child {
        border-left-width: 0;
      }

      thead {
        background-color: #e0e0e0;
        color: #000;
        text-align: left;
        vertical-align: bottom;
      }
    `}</style>
    <table>
      <thead>
        <tr>
          {props.columnNames.map(column => (
            <th key={column.index}>{column.name}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {props.rows.map((row, idx) => (
          <tr key={idx}>
            {row.map((item, colIdx) => (
              <td key={colIdx}>{item}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </React.Fragment>
);

const DSVTable = (props: { data: Array<Object> }) => {
  if (!Array.isArray(props.data) || props.data.length <= 0) {
    return null;
  }

  const columnNames = Object.keys(props.data[0]);
  const rows = props.data;

  return (
    <React.Fragment>
      <style jsx>{`
        table {
          border-collapse: collapse;
          border-spacing: 0;
          border-collapse: collapse;
          border-spacing: 0;
          empty-cells: show;
          border: 1px solid #cbcbcb;
          max-height: 200px;
          overflow-y: scroll;
        }

        td,
        th {
          padding: 0;
          border-left: 1px solid #cbcbcb; /*  inner column border */
          border-width: 0 0 0 1px;
          font-size: inherit;
          margin: 0;
          overflow: visible; /*to make ths where the title is really long work*/
          padding: 0.5em 1em; /* cell padding */
        }

        td:first-child,
        th:first-child {
          border-left-width: 0;
        }

        thead {
          background-color: #e0e0e0;
          color: #000;
          text-align: left;
          vertical-align: bottom;
        }
      `}</style>
      <table>
        <thead>
          <tr>
            {columnNames.map((column, idx) => (
              <th key={idx}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx}>
              {columnNames.map((k, colIdx) => (
                <td key={colIdx}>{row[k]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </React.Fragment>
  );
};

// Old style Zeppelin
const Message = props => {
  switch (props.type) {
    case "HTML":
      return <HTMLTransform data={props.data} />;
    case "TEXT":
      return <Text data={props.data} />;
    default:
      return null;
  }
};

const Result = props => {
  if (!props.result || props.result.msg === "") {
    return null;
  }

  switch (props.result.type) {
    case "HTML":
      return <HTMLTransform data={props.result.msg} />;
    case "TEXT":
      return <Text data={props.result.msg} />;
    case "TABLE":
      if (!props.result.columnNames || !props.result.rows) {
        const data = d3.tsvParse(props.result.msg);

        return <DSVTable data={data} />;
      }
      return (
        <HokeyTable
          columnNames={props.result.columnNames}
          rows={props.result.rows}
        />
      );
    default:
      return null;
  }
};

const whichLanguage = source => {
  if (/^%md/.test(source)) {
    return "markdown";
  }

  if (/^%sql/.test(source)) {
    return "text/x-hive";
  }

  if (/^%pig/.test(source)) {
    return "pig";
  }

  if (
    /^%spark\.pyspark/.test(source) ||
    /^%pyspark/.test(source) ||
    /^%python/.test(source)
  ) {
    return "python";
  }

  if (/^%sh/.test(source)) {
    return "shell";
  }

  if (/^%spark/.test(source)) {
    return "text/x-scala";
  }

  if (/^%r/.test(source)) {
    return "r";
  }

  if (/^%html/.test(source)) {
    return "html";
  }

  return "text/x-scala";
};

const Paragraph = props => {
  const lang = whichLanguage(props.text);

  let resultView = null;
  if (props.result) {
    resultView = <Result result={props.result} />;
  } else if (props.results && Array.isArray(props.results.msg)) {
    resultView = props.results.msg.map((item, idx) => (
      <Message {...item} key={idx} />
    ));
  }

  if (lang === "markdown") {
    return (
      <div
        style={{
          paddingBottom: "10px",
          paddingTop: "10px"
        }}
      >
        {resultView}
      </div>
    );
  }

  return (
    <React.Fragment>
      <Source language={lang}>{props.text}</Source>
      <div
        style={{
          paddingBottom: "10px",
          paddingTop: "10px"
        }}
      >
        {resultView}
      </div>
    </React.Fragment>
  );
};

type ZeppelinViewProps = {
  notebook: {
    name: string,
    paragraphs: Array<ZParagraph>
  }
};

type ZParagraph = any;

const ZeppelinView = (props: ZeppelinViewProps) => {
  return (
    <div style={{ paddingLeft: "10px" }}>
      <h1>{props.notebook.name}</h1>
      {props.notebook.paragraphs.map(p => (
        <Paragraph key={p.id} {...p} />
      ))}
    </div>
  );
};

export default ZeppelinView;
