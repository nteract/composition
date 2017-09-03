const Ansi = require("../src/index");
const React = require("react");
const expect = require("chai").expect;
const enzyme = require("enzyme");

const GREEN_FG = "\u001b[32m";
const YELLOW_BG = "\u001b[43m";
const RESET = "\u001b[0;m";

describe("Ansi", () => {
  it("hello world", () => {
    const el = enzyme.shallow(React.createElement(Ansi, null, "hello world"));
    expect(el).to.not.be.null;
    expect(el.text()).to.equal("hello world");
  });

  it("can color", () => {
    const el = enzyme.shallow(
      React.createElement(Ansi, null, `hello ${GREEN_FG}world`)
    );
    expect(el).to.not.be.null;
    expect(el.text()).to.equal("hello world");
    expect(el.html()).to.equal(
      '<code><span>hello </span><span style="color:rgb(0, 187, 0);">world</span></code>'
    );
  });

  it("can have className", () => {
    const el = enzyme.shallow(
      React.createElement(Ansi, { className: "my-class" }, `hello world`)
    );
    expect(el).to.not.be.null;
    expect(el.text()).to.equal("hello world");
    expect(el.html()).to.equal(
      '<code class="my-class"><span>hello world</span></code>'
    );
  });

  it("can nest", () => {
    const el = enzyme.shallow(
      React.createElement(
        Ansi,
        null,
        `hello ${GREEN_FG}wo${YELLOW_BG}rl${RESET}d`
      )
    );
    expect(el).to.not.be.null;
    expect(el.text()).to.equal("hello world");
    expect(el.html()).to.equal(
      '<code><span>hello </span><span style="color:rgb(0, 187, 0);">wo</span><span style="background-color:rgb(187, 187, 0);color:rgb(0, 187, 0);">rl</span><span>d</span></code>'
    );
  });

  it("can handle carriage symbol", () => {
    const el = enzyme.shallow(
      React.createElement(
        Ansi,
        null,
        "this sentence\rthat\nwill make you pause"
      )
    );
    expect(el).to.not.be.null;
    expect(el.text()).to.equal("that sentence\nwill make you pause");
  });

  it("can linkify", () => {
    const el = enzyme.shallow(
      React.createElement(
        Ansi,
        { linkify: true },
        "this is a link: https://nteract.io/"
      )
    );
    expect(el).to.not.be.null;
    expect(el.text()).to.equal("this is a link: https://nteract.io/");
    expect(el.html()).to.equal(
      '<code><span>this is a link: <a href="https://nteract.io/" target="_blank">https://nteract.io/</a></span></code>'
    );
  });

  it("can distinguish URL-ish text", () => {
    const el = enzyme.shallow(
      React.createElement(
        Ansi,
        { linkify: true },
        "<transport.model.TransportInfo"
      )
    );
    expect(el).to.not.be.null;
    expect(el.text()).to.equal("<transport.model.TransportInfo");
  });

  it("can distinguish URL-ish text", () => {
    const el = enzyme.shallow(
      React.createElement(
        Ansi,
        { linkify: true },
        "<module 'something' from '/usr/local/lib/python2.7/dist-packages/something/__init__.pyc'>"
      )
    );
    expect(el).to.not.be.null;
    expect(el.text()).to.equal(
      "<module 'something' from '/usr/local/lib/python2.7/dist-packages/something/__init__.pyc'>"
    );
  });
});
