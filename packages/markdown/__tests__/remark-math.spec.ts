import unified from "unified";
import parse from "remark-parse";
import stringify from "remark-stringify";
import u from "unist-builder";

import math from "../src/remark-math";

function remark() {
  return unified()
    .use(parse, {
      position: false
    })
    .use(stringify);
}

describe("remark-math", () => {
  it("must parse a math inline and a math block ", () => {
    const processor = remark().use(math);

    const targetText = [
      "Math $\\alpha$",
      "",
      "$$",
      "\\beta+\\gamma",
      "$$"
    ].join("\n");

    const ast = processor.parse(targetText);

    expect(ast).toMatchObject(
      u("root", [
        u("paragraph", [u("text", "Math "), u("inlineMath", "\\alpha")]),
        u("math", "\\beta+\\gamma")
      ])
    );
  });

  it("must escape a dollar with backslash", () => {
    const processor = remark().use(math);

    const targetText = "$\\alpha\\$";

    const ast = processor.parse(targetText);
    expect(ast).toMatchObject(
      u("root", [u("paragraph", [u("text", "$\\alpha$")])])
    );
  });

  it("must escape all dollars with backslashes", () => {
    const processor = remark().use(math);

    const targetText = "\\$\\alpha\\$";

    const ast = processor.parse(targetText);
    expect(ast).toMatchObject(
      u("root", [u("paragraph", [u("text", "$"), u("text", "\\alpha$")])])
    );
  });

  it("must NOT escape a dollar with double backslashes", () => {
    const processor = remark().use(math);

    const targetText = "\\\\$\\alpha$";

    const ast = processor.parse(targetText);

    expect(ast).toMatchObject(
      u("root", [u("paragraph", [u("text", "\\"), u("inlineMath", "\\alpha")])])
    );
  });

  it("must not parse a raw starting dollar", () => {
    const processor = remark().use(math);

    const targetText = "`$`\\alpha$";

    const ast = processor.parse(targetText);
    expect(ast).toMatchObject(
      u("root", [u("paragraph", [u("inlineCode", "$"), u("text", "\\alpha$")])])
    );
  });

  it("fooo must not parse a raw ending dollar", () => {
    const processor = remark().use(math);

    const targetText = "$\\alpha`$` foo";

    const ast = processor.parse(targetText);
    expect(ast).toMatchObject(
      u("root", [
        u("paragraph", [
          u("text", "$\\alpha"),
          u("inlineCode", "$"),
          u("text", " foo")
        ])
      ])
    );
  });

  it("fooo must not parse allow inline to contain backticks", () => {
    const processor = remark().use(math);

    const targetText = "$`\\alpha`$";

    const ast = processor.parse(targetText);
    expect(ast).toMatchObject(
      u("root", [u("paragraph", [u("inlineMath", "`\\alpha`")])])
    );
  });

  it("must render a super factorial to a math block", () => {
    const processor = remark().use(math);

    const targetText = "$\\alpha\\$$";

    const ast = processor.parse(targetText);

    expect(ast).toMatchObject(
      u("root", [u("paragraph", [u("inlineMath", "\\alpha\\$")])])
    );
  });

  it("must render super factorial to a math inline", () => {
    const processor = remark().use(math);

    const targetText = ["$$", "\\alpha\\$", "$$"].join("\n");

    const ast = processor.parse(targetText);

    expect(ast).toMatchObject(u("root", [u("math", "\\alpha\\$")]));
  });

  it("must render a math block just after a pragraph", () => {
    const processor = remark().use(math);

    const targetText = ["tango", "$$", "\\alpha", "$$"].join("\n");

    const ast = processor.parse(targetText);

    expect(ast).toMatchObject(
      u("root", [u("paragraph", [u("text", "tango")]), u("math", "\\alpha")])
    );
  });

  it("must parse inline math between double dollars", () => {
    const processor = remark().use(math);

    const targetText = "$$\\alpha$$";

    const ast = processor.parse(targetText);

    expect(ast).toMatchObject(
      u("root", [u("paragraph", [u("math", "\\alpha")])])
    );
  });

  it("must stringify", () => {
    const processor = remark().use(math);

    const targetText = ["$$\\alpha$$", "$$", "\\alpha\\beta", "$$"].join("\n");

    const result = processor.processSync(targetText).toString();

    expect(result).toEqual(
      ["$$\n\\alpha\n$$", "", "$$", "\\alpha\\beta", "$$", ""].join("\n")
    );
  });

  it("must stringify math block child of blockquote", () => {
    const processor = remark().use(math);

    const targetText = ["> $$", "> \\alpha\\beta", "> $$"].join("\n");

    const result = processor.processSync(targetText).toString();

    expect(result).toEqual(["> $$", "> \\alpha\\beta", "> $$", ""].join("\n"));
  });

  it("must parse math block with indent", () => {
    const processor = remark().use(math);

    const targetText = ["  $$$", "    \\alpha", "  $$$"].join("\n");

    const ast = processor.parse(targetText);

    expect(ast).toMatchObject(u("root", [u("math", "  \\alpha")]));
  });

  it("must ignore everything just after opening/closing marker", () => {
    const processor = remark().use(math);

    const targetText = ["$$  must", "\\alpha", "$$  be ignored", ""].join("\n");

    const ast = processor.parse(targetText);

    expect(ast).toMatchObject(u("root", [u("math", "\\alpha")]));
  });

  it("must not affect next block", () => {
    const processor = remark().use(math);

    const targetText = ["$$", "\\alpha", "$$", "```", "code fence", "```"].join(
      "\n"
    );

    const ast = processor.parse(targetText);

    expect(ast).toMatchObject(
      u("root", [u("math", "\\alpha"), u("code", "code fence")])
    );
  });

  it("must not set inlineMathDouble class", () => {
    const processor = remark().use(math);

    const targetText = "$$\\alpha$$";

    const ast = processor.parse(targetText);

    expect(ast).toEqual(
      u("root", [
        u("paragraph", [
          u(
            "math",
            {
              data: {
                hChildren: [u("text", "\\alpha")],
                hName: "div",
                hProperties: {
                  className: "math"
                }
              }
            },
            "\\alpha"
          )
        ])
      ])
    );
  });

  // it("must set inlineMathDouble class if inlineMathDouble is true", () => {
  //   const processor = remark().use(math, {
  //     inlineMathDouble: true
  //   });

  //   const targetText = "hello $$\\alpha$$ world";

  //   const ast = processor.parse(targetText);

  //   expect(ast).toEqual(
  //     u("root", [
  //       u("paragraph", [
  //         u("text", "hello "),
  //         u(
  //           "math",
  //           {
  //             data: {
  //               hChildren: [u("text", "\\alpha")],
  //               hName: "div",
  //               hProperties: {
  //                 className: "math inlineMathDouble"
  //               }
  //             }
  //           },
  //           "\\alpha"
  //         ),
  //         u("text", " world")
  //       ])
  //     ])
  //   );
  // });

  it("must parse more complex math equations in math block", () => {
    const processor = remark().use(math);

    const targetText =
      "$$p(\\theta_i \\thinspace | \\, \\{\\theta_{j \\neq i}\\}, D)$$";

    const ast = processor.parse(targetText);

    expect(ast).toEqual(
      u("root", [
        u("paragraph", [
          u(
            "math",
            {
              data: {
                hChildren: [
                  u(
                    "text",
                    "p(\\theta_i \\thinspace | \\, \\{\\theta_{j \\neq i}\\}, D)"
                  )
                ],
                hName: "div",
                hProperties: {
                  className: "math"
                }
              }
            },
            "p(\\theta_i \\thinspace | \\, \\{\\theta_{j \\neq i}\\}, D)"
          )
        ])
      ])
    );
  });

  it("must parse more complex math equations inline math", () => {
    const processor = remark().use(math);

    const targetText =
      "$p(\\theta_i \\thinspace | \\, \\{\\theta_{j \\neq i}\\}, D)$";

    const ast = processor.parse(targetText);

    expect(ast).toEqual(
      u("root", [
        u("paragraph", [
          u(
            "inlineMath",
            {
              data: {
                hChildren: [
                  u(
                    "text",
                    "p(\\theta_i \\thinspace | \\, \\{\\theta_{j \\neq i}\\}, D)"
                  )
                ],
                hName: "span",
                hProperties: {
                  className: "inlineMath"
                }
              }
            },
            "p(\\theta_i \\thinspace | \\, \\{\\theta_{j \\neq i}\\}, D)"
          )
        ])
      ])
    );
  });
});
