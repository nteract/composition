import React from "react";

import {
  richestMimetype,
  standardDisplayOrder,
  standardTransforms
} from "@nteract/transforms";

// Jupyter style MIME bundle
const bundle = {
  "text/plain": "This is great",
  "image/png": "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "application/vdom.v1+json": {
    tagName: "h1",
    children: "raw data ➡ rendered view",
    attributes: {}
  }
};

// Find out which mimetype is the richest
const mimetype = richestMimetype(
  bundle,
  standardDisplayOrder,
  standardTransforms
);

// Get the matching React.Component for that mimetype
let Transform = standardTransforms[mimetype];

export default () => {
  return (
    <div className="root">
      <h1>Showcasing nteract components</h1>

      <hr />

      <h2>
        <pre>@nteract/transforms</pre>
      </h2>
      <Transform data={bundle[mimetype]} />

      <style jsx>{`
        font-family: "Source Sans Pro", Helvetica Neue, Helvetica, Arial,
          sans-serif;
      `}</style>
    </div>
  );
};
