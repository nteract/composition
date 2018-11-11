// Extracted from https://github.com/eldargab/load-script

interface Options {
  type: string;
  charset: string;
  async: any;
  text?: string;
  attrs?: { [key: string]: any };
}

type Callback = (script: HTMLScriptElement, error?: Error) => void;

const defaultOptions = {
  type: "text/javascript",
  charset: "utf8",
  async: false,
  text: undefined,
  attrs: undefined
};

export function load(src: string, opts?: Options | Callback, cb?: Callback) {
  const head = document.head || document.getElementsByTagName("head")[0];
  const script = document.createElement("script");

  if (typeof opts === "function") {
    cb = opts;
    opts = defaultOptions;
  }

  opts = opts || defaultOptions;
  cb = cb || function() {};

  script.type = opts.type || "text/javascript";
  script.charset = opts.charset || "utf8";
  script.async = "async" in opts ? !!opts.async : true;
  script.src = src;

  if (opts.attrs) {
    setAttributes(script, opts.attrs);
  }

  if (opts.text) {
    script.text = "" + opts.text;
  }

  const onend = "onload" in script ? stdOnEnd : ieOnEnd;
  onend(script, cb);

  // some good legacy browsers (firefox) fail the 'in' detection above
  // so as a fallback we always set onload
  // old IE will ignore this and new IE will set onload
  if (!script.onload) {
    stdOnEnd(script, cb);
  }

  head.appendChild(script);
}

function setAttributes(
  script: HTMLScriptElement,
  attrs: { [key: string]: any }
) {
  for (let attr in attrs) {
    script.setAttribute(attr, attrs[attr]);
  }
}

function stdOnEnd(script: any, cb: Callback) {
  script.onload = function() {
    this.onerror = this.onload = null;
    cb(script);
  };
  script.onerror = function() {
    // this.onload = null here is necessary
    // because even IE9 works not like others
    this.onerror = this.onload = null;
    cb(script, new Error("Failed to load " + this.src));
  };
}

function ieOnEnd(script: any, cb: Callback) {
  script.onreadystatechange = function() {
    if (this.readyState != "complete" && this.readyState != "loaded") return;
    this.onreadystatechange = null;
    cb(script); // there is no way to catch loading errors in IE8
  };
}

export default load;
