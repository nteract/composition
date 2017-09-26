const Ansi = require("../src/index");
const React = require("react");
const enzyme = require("enzyme");

import { configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

configure({ adapter: new Adapter() });

const GREEN_FG = "\u001b[32m";
const YELLOW_BG = "\u001b[43m";
const RESET = "\u001b[0;m";

describe("Ansi", () => {
  test("hello world", () => {
    const el = enzyme.shallow(React.createElement(Ansi, null, "hello world"));
    expect(el).not.toBeNull();
    expect(el.text()).toBe("hello world");
  });

  test("can color", () => {
    const el = enzyme.shallow(
      React.createElement(Ansi, null, `hello ${GREEN_FG}world`)
    );
    expect(el).not.toBeNull();
    expect(el.text()).toBe("hello world");
    expect(el.html()).toBe(
      '<code><span>hello </span><span style="color:rgb(0, 187, 0)">world</span></code>'
    );
  });

  test("can have className", () => {
    const el = enzyme.shallow(
      React.createElement(Ansi, { className: "my-class" }, `hello world`)
    );
    expect(el).not.toBeNull();
    expect(el.text()).toBe("hello world");
    expect(el.html()).toBe(
      '<code class="my-class"><span>hello world</span></code>'
    );
  });

  test("can nest", () => {
    const el = enzyme.shallow(
      React.createElement(
        Ansi,
        null,
        `hello ${GREEN_FG}wo${YELLOW_BG}rl${RESET}d`
      )
    );
    expect(el).not.toBeNull();
    expect(el.text()).toBe("hello world");
    expect(el.html()).toBe(
      '<code><span>hello </span><span style="color:rgb(0, 187, 0)">wo</span><span style="background-color:rgb(187, 187, 0);color:rgb(0, 187, 0)">rl</span><span>d</span></code>'
    );
  });

  test("can handle carriage symbol", () => {
    const el = enzyme.shallow(
      React.createElement(
        Ansi,
        null,
        "this sentence\rthat\nwill make you pause"
      )
    );
    expect(el).not.toBeNull();
    expect(el.text()).toBe("that sentence\nwill make you pause");
  });

  test("can linkify", () => {
    const el = enzyme.shallow(
      React.createElement(
        Ansi,
        { linkify: true },
        "this is a link: https://nteract.io/"
      )
    );
    expect(el).not.toBeNull();
    expect(el.text()).toBe("this is a link: https://nteract.io/");
    expect(el.html()).toBe(
      '<code><span>this is a link: <a href="https://nteract.io/" target="_blank">https://nteract.io/</a></span></code>'
    );
  });

  test("can distinguish URL-ish text", () => {
    const el = enzyme.shallow(
      React.createElement(
        Ansi,
        { linkify: true },
        "<transport.model.TransportInfo"
      )
    );
    expect(el).not.toBeNull();
    expect(el.text()).toBe("<transport.model.TransportInfo");
  });

  test("can distinguish URL-ish text", () => {
    const el = enzyme.shallow(
      React.createElement(
        Ansi,
        { linkify: true },
        "<module 'something' from '/usr/local/lib/python2.7/dist-packages/something/__init__.pyc'>"
      )
    );
    expect(el).not.toBeNull();
    expect(el.text()).toBe(
      "<module 'something' from '/usr/local/lib/python2.7/dist-packages/something/__init__.pyc'>"
    );
  });
});
