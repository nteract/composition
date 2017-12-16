// flow-typed signature: 12ca90f2258926f80c00486f72690ea1
// flow-typed version: 2c4367e37c/node-fetch_v1.x.x/flow_>=v0.44.x

declare module 'node-fetch' {
  declare export class Request mixins Body {
    constructor(input: string | Request, init?: RequestInit): this;
    method: string;
    url: string;
    headers: Headers;
    context: RequestContext;
    referrer: string;
    redirect: RequestRedirect;

    // node-fetch extensions
    compress: boolean;
    agent: http$Agent;
    counter: number;
    follow: number;
    hostname: string;
    protocol: string;
    port: number;
    timeout: number;
    size: number
  }

  declare interface RequestInit {
    method?: string,
    headers?: HeaderInit | {
      [index: string]: string
    },
    body?: BodyInit,
    redirect?: RequestRedirect,

    // node-fetch extensions
    timeout?: number,
    compress?: boolean,
    size?: number,
    agent?: http$Agent,
    follow?: number
  }

  declare type RequestContext =
    'audio' | 'beacon' | 'cspreport' | 'download' | 'embed' |
    'eventsource' | 'favicon' | 'fetch' | 'font' | 'form' | 'frame' |
    'hyperlink' | 'iframe' | 'image' | 'imageset' | 'import' |
    'internal' | 'location' | 'manifest' | 'object' | 'ping' | 'plugin' |
    'prefetch' | 'script' | 'serviceworker' | 'sharedworker' |
    'subresource' | 'style' | 'track' | 'video' | 'worker' |
    'xmlhttprequest' | 'xslt';
  declare type RequestRedirect = 'follow' | 'error' | 'manual';

  declare export class Headers {
    append(name: string, value: string): void;
    delete(name: string): void;
    get(name: string): string;
    getAll(name: string): Array<string>;
    has(name: string): boolean;
    set(name: string, value: string): void;
    forEach(callback: (value: string, name: string) => void): void
  }

  declare export class Body {
    bodyUsed: boolean;
    body: stream$Readable;
    json(): Promise<any>;
    json<T>(): Promise<T>;
    text(): Promise<string>;
    buffer(): Promise<Buffer >
  }

  declare export class Response mixins Body {
    constructor(body?: BodyInit, init?: ResponseInit): this;
    error(): Response;
    redirect(url: string, status: number): Response;
    type: ResponseType;
    url: string;
    status: number;
    ok: boolean;
    size: number;
    statusText: string;
    timeout: number;
    headers: Headers;
    clone(): Response
  }

  declare type ResponseType =
    | 'basic'
    | 'cors'
    | 'default'
    | 'error'
    | 'opaque'
    | 'opaqueredirect';

  declare interface ResponseInit {
    status: number,
    statusText?: string,
    headers?: HeaderInit
  }

  declare type HeaderInit = Headers | Array<string>;
  declare type BodyInit = string;

  declare export default function fetch(url: string | Request, init?: RequestInit): Promise<Response>
}
