// @flow

import type { $Request, $Response } from "express";

const { parse } = require("url");
const http = require("http");

const express = require("express");
const morgan = require("morgan");
const Log = require("log");

const front = require("../frontend");

const config = require("./config");

const log = new Log("info");

function createServer() {
  const frontend = front.createNextApp();

  return frontend.app.prepare().then(() => {
    const app = express();
    app.use(morgan("common"));

    log.info(`Node env: ${config.nodeEnv}`);

    const router = require("./routes");

    /**
     *
     * /view/ router
     *
     * On some filetypes it will serve the next.js app and on others it will
     * redirect to the literal file. This is to allow for resolving relative
     * assets like images within notebooks.
     */
    const suffixRegex = /(?:\.([^.]+))?$/;
    const renderSuffixes = new Set(["ipynb", "html", "json", "md", "rmd"]);
    const renderAccepts = new Set(["text/html", "application/xhtml+xml"]);
    const viewHandler = (req: $Request, res: $Response) => {
      const presuffix = suffixRegex.exec(req.path);

      if (!presuffix) {
        return null;
      }

      const suffix = (presuffix[1] || "").toLowerCase();
      const accepts = (req.headers.accept || "").split(",");

      if (
        // If one of our suffixes is a renderable item
        renderSuffixes.has(suffix) ||
        // If the file is requested as `text/html` first and foremost, we'll also
        // render our file viewer
        renderAccepts.has(accepts[0]) ||
        renderAccepts.has(accepts[1])
      ) {
        const { query } = parse(req.url, true);
        const viewPath = req.params["0"] || "/";
        const q = Object.assign({}, { viewPath }, query);
        return frontend.app.render(req, res, "/view", q);
      }

      const newPath = req.path.replace(/^\/view/, "/files");
      res.redirect(newPath);
      return;
    };

    /**
     * Express middleware for letting our next.js frontend do the handling
     */
    const passToNext = (req: $Request, res: $Response) => {
      return frontend.handle(req, res);
    };

    router.get(["/view", "/view*"], viewHandler);
    router.get("*", passToNext);

    // TODO: Leaving this here for the eventual baseURL handling
    const baseURI = "/";
    app.use(baseURI, router);
    // TODO: This is duplicate until we're doing proper baseURL handling
    app.get(["/view", "/view*"], viewHandler);
    app.use(passToNext);

    const server = http.createServer(app);

    return new Promise(accept => {
      // $FlowFixMe
      server.listen(config.port, () => accept(server));
    });
  });
}

module.exports = createServer;
