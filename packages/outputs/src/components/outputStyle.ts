export default `
& a {
  color: var(--link-color-unvisited, blue);
}

& a:visited {
  color: var(--link-color-visited, blue);
}

& code {
  font-family: "Source Code Pro";
  white-space: pre-wrap;
  font-size: 14px;
}

& pre {
  white-space: pre-wrap;
  font-size: 14px;
  word-wrap: break-word;
}

& img {
  display: block;
  max-width: 100%;
}

& kbd {
  display: inline-block;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 0.1em 0.5em;
  margin: 0 0.2em;
  box-shadow: 0 1px 0px rgba(0, 0, 0, 0.2), 0 0 0 2px #fff inset;
  background-color: #f7f7f7;
}

& table {
  border-collapse: collapse;
}

& th,
& td,
/* for legacy output handling */
& .th,
& .td {
  padding: 0.5em 1em;
  border: 1px solid var(--theme-app-border, #cbcbcb);
}

& th {
  text-align: left;
}

& blockquote {
  padding: 0.75em 0.5em 0.75em 1em;
  background: var(--theme-cell-output-bg, white);
  border-left: 0.5em solid #ddd;
}

& blockquote::before {
  display: block;
  height: 0;
  content: "“";
  margin-left: -0.95em;
  font: italic 400%/1 Open Serif, Georgia, "Times New Roman", serif;
  color: solid var(--theme-app-border, #cbcbcb);
}

/* for nested paragraphs in block quotes */
& blockquote p {
  display: inline;
}

& dd {
  display: block;
  -webkit-margin-start: 40px;
}
& dl {
  display: block;
  -webkit-margin-before: 1__qem;
  -webkit-margin-after: 1em;
  -webkit-margin-start: 0;
  -webkit-margin-end: 0;
}

& dt {
  display: block;
}

& dl {
  width: 100%;
  overflow: hidden;
  padding: 0;
  margin: 0;
}

& dt {
  font-weight: bold;
  float: left;
  width: 20%;
  /* adjust the width; make sure the total of both is 100% */
  padding: 0;
  margin: 0;
}

& dd {
  float: left;
  width: 80%;
  /* adjust the width; make sure the total of both is 100% */
  padding: 0;
  margin: 0;
}

/** Adaptation for the R kernel's inline lists **/
& .list-inline li {
  display: inline;
  padding-right: 20px;
  text-align: center;
}`;
