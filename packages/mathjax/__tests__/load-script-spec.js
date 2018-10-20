import load from "../src/load-script";

test("Load script", () => {
  expect(document.head).toMatchSnapshot();
  load("script-path");
  expect(document.head).toMatchSnapshot();
});
