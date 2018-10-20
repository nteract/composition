// flow-typed signature: aabff1126ddc67fe1e0d9ac53a4e890d
// flow-typed version: da30fe6876/morgan_v1.x.x/flow_>=v0.25.x

/* @flow */
import type { Middleware, $Request, $Response } from "express";

declare module "morgan" {
  declare type FormatFn = (
    tokens: TokenIndexer,
    req: $Request,
    res: $Response
  ) => string;

  declare type TokenCallbackFn = (
    req: $Request,
    res: $Response,
    arg?: string | number | boolean
  ) => string;

  declare interface TokenIndexer {
    [tokenName: string]: TokenCallbackFn;
  }

  /**
   * Public interface of morgan logger
   */
  declare interface Morgan {
    /***
     * Create a new morgan logger middleware function using the given format and options. The format argument may be a string of a predefined name (see below for the names),
     * or a string of a format string containing defined tokens.
     * @param format
     * @param options
     */
    (format: string, options?: Options): Middleware;
    /***
     * Standard Apache combined log output.
     * :remote-addr - :remote-user [:date] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"
     * @param format
     * @param options
     */
    (format: "combined", options?: Options): Middleware;
    /***
     * Standard Apache common log output.
     * :remote-addr - :remote-user [:date] ":method :url HTTP/:http-version" :status :res[content-length]
     * @param format
     * @param options
     */
    (format: "common", options?: Options): Middleware;
    /**
     * Concise output colored by response status for development use. The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
     * :method :url :status :response-time ms - :res[content-length]
     * @param format
     * @param options
     */
    (format: "dev", options?: Options): Middleware;

    /***
     * Shorter than default, also including response time.
     * :remote-addr :remote-user :method :url HTTP/:http-version :status :res[content-length] - :response-time ms
     * @param format
     * @param options
     */
    (format: "short", options?: Options): Middleware;

    /***
     * The minimal output.
     * :method :url :status :res[content-length] - :response-time ms
     * @param format
     * @param options
     */
    (format: "tiny", options?: Options): Middleware;

    /***
     * Create a new morgan logger middleware function using the given format and options. The format argument may be a
     * custom format function which adheres to the signature.
     * @param format
     * @param options
     */
    (format: FormatFn, options?: Options): Middleware;

    /**
     * Define a custom token which can be used in custom morgan logging formats.
     */
    token(name: string, callback: TokenCallbackFn): Morgan;
    /**
     * Define a named custom format by specifying a format string in token notation
     */
    format(name: string, fmt: string): Morgan;

    /**
     * Define a named custom format by specifying a format function
     */
    format(name: string, fmt: FormatFn): Morgan;

    /**
     * Compile a format string in token notation into a format function
     */
    compile(format: string): FormatFn;
  }

  /**
   * Define a custom token which can be used in custom morgan logging formats.
   */
  declare function token(name: string, callback: TokenCallbackFn): Morgan;

  /**
   * Define a named custom format by specifying a format string in token notation
   */
  declare function format(name: string, fmt: string): Morgan;

  /**
   * Define a named custom format by specifying a format function
   */
  declare function format(name: string, fmt: FormatFn): Morgan;

  /**
   * Compile a format string in token notation into a format function
   */
  declare function compile(format: string): FormatFn;

  declare interface StreamOptions {
    /**
     * Output stream for writing log lines
     */
    write: (str: string) => void;
  }

  /***
   * Morgan accepts these properties in the options object.
   */
  declare interface Options {
    /***
     * Buffer duration before writing logs to the stream, defaults to false. When set to true, defaults to 1000 ms.
     */
    buffer?: boolean;

    /***
     * Write log line on request instead of response. This means that a requests will be logged even if the server crashes, but data from the response cannot be logged (like the response code).
     */
    immediate?: boolean;

    /***
     * Function to determine if logging is skipped, defaults to false. This function will be called as skip(req, res).
     */
    skip?: (req: $Request, res: $Response) => boolean;

    /***
     * Output stream for writing log lines, defaults to process.stdout.
     * @param str
     */
    stream?: StreamOptions;
  }

  declare module.exports: Morgan;
}
